require('dotenv').config({ path: __dirname + '/../.env' });
const { DELAY_EXCHANGE, SCHEDULED_INTERVAL_HOUR, WORKERS_ERROR_FILE_PATH } = process.env;
require('../logger/index').setLogger(WORKERS_ERROR_FILE_PATH);
const RabbitMQ = require('./../utils/rabbit');

const { pool } = require('./../server/models/mysqlcon');
const { NOTIFICATION_STATUS, updateNotificationStatus } = require('./../server/models/notifications');
const { diffFromNow } = require('./../utils/timeUtils');
const mongo = require('./../server/models/mongoconn');

const publishToDelayExchange = async () => {
  try {
    await mongo.connect();
    const [notifications] = await pool.query(
      `SELECT id, channel_id, type, scheduled_dt FROM notifications 
        WHERE status = ? AND scheduled_dt < DATE_ADD(NOW(), INTERVAL ? HOUR);`,
      [NOTIFICATION_STATUS.RECEIVED, SCHEDULED_INTERVAL_HOUR]
    );

    if (notifications.length === 0) {
      console.info('[publishToDelayExchange] No scheduled notification moved to queue');
      return;
    }

    for (let notification of notifications) {
      let delay = diffFromNow(notification.scheduled_dt);
      let job = { notificationId: notification.id, channelId: notification.channel_id, sendType: notification.type };
      let jobOptions = {
        headers: { 'x-delay': delay * 1000 },
        contentType: 'application/json',
      };
      await RabbitMQ.publishMessage(DELAY_EXCHANGE, '', JSON.stringify(job), jobOptions);
      await updateNotificationStatus(notification.id, { status: NOTIFICATION_STATUS.ONQUEUE });
      console.debug('[publishToDelayExchange] Successfully publish to delay exchange: %o', job);
    }
  } catch (error) {
    console.error('[publishToDelayExchange] Publish Error: %o', error);
  } finally {
    await mongo.disconnect();
    await pool.end();
  }
};

// rabbitmq.connectToPublish(publishToDelayExchange);
(async function () {
  await RabbitMQ.connect();
  await RabbitMQ.startPublish();
  await publishToDelayExchange();
  await RabbitMQ.closeConnection();
  process.exit(0);
})();
