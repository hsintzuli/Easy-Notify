require('dotenv').config({ path: __dirname + '/../.env' });
const { DELAY_QUEUE, WORKERS_ERROR_FILE_PATH } = process.env;
require('../logger/index').setLogger(WORKERS_ERROR_FILE_PATH);
const NotificationJobs = require('../utils/notificationJobs');
const RabbitMQ = require('../utils/rabbit');
const { createErrorLog } = require('../server/models/notificationErrorLog');

async function fnConsumer(msg, ack) {
  try {
    const job = JSON.parse(msg.content.toString());
    console.info('[fnConsumer] Transfer delayed job from delayed exchange to realtime exchange: %o', job);
    if (job.sendType === 'websocket') {
      await NotificationJobs.genWebsocketJob(job.notificationId, job.channelId);
    } else {
      await NotificationJobs.genWebpushJob(job.notificationId, job.channelId);
    }

    console.info('Successfully Transfer!');
    return ack(true);
  } catch (error) {
    await createErrorLog(error);
    console.error('[fnConsumer] Record error in MongoDB: %o', error);
    ack(true);
  }
}

(async function () {
  await RabbitMQ.connect();
  await RabbitMQ.startPublish();
  await RabbitMQ.consumeQueue(DELAY_QUEUE, fnConsumer);
})();
