const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const RabbitMQ = require('./../utils/rabbit');
const { DELAY_EXCHANGE, SCHEDULED_INTERVAL_HOUR } = process.env;
const { pool } = require('./../server/models/mysqlcon');
const { NOTIFICATION_STATUS, updateNotificationStatus } = require('./../server/models/notifications');
const _ = require('lodash');
const { diffFromNow } = require('./../utils/timeUtils');
const mongo = require('./../server/models/mongoconn');

const publishToDelayExchange = async () => {
  try {
    mongo.connect();
    const [notifications] = await pool.query(
      `SELECT id, channel_id, type, scheduled_dt FROM notifications 
        WHERE status = ? AND scheduled_dt < DATE_ADD(NOW(), INTERVAL ? HOUR);`,
      [NOTIFICATION_STATUS.RECEIVED, SCHEDULED_INTERVAL_HOUR]
    );

    if (notifications.length === 0) {
      console.log('No scheduled notification moved to queue');
      return;
    }

    for (let notification of notifications) {
      let delay = diffFromNow(notification.sendTime);
      let job = { notificationId: notification.id, channelId: notification.channel_id, sendType: notification.type };
      let jobOptions = {
        headers: { 'x-delay': delay * 1000 },
        contentType: 'application/json',
      };
      await RabbitMQ.publishMessage(DELAY_EXCHANGE, '', JSON.stringify(job), jobOptions);
      await updateNotificationStatus(notification.id, { status: NOTIFICATION_STATUS.ONQUEUE });
    }
  } catch (error) {
    console.error(error);
  } finally {
    mongo.disconnect();
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
