require('dotenv').config({ path: __dirname + '/../.env' });
const NotificationJobs = require('../utils/notificationJobs');
const RabbitMQ = require('../utils/rabbit');
const { createErrorLog } = require('../server/models/notificationErrorLog');
const { DELAY_QUEUE } = process.env;

async function fnConsumer(msg, ack) {
  try {
    const job = JSON.parse(msg.content.toString());
    console.log('Transfer delayed job from delayed exchange to realtime exchange', job);
    if (job.sendType === 'websocket') {
      await NotificationJobs.genWebsocketJob(job.notificationId, job.channelId);
    } else {
      await NotificationJobs.genWebpushJob(job.notificationId, job.channelId);
    }

    console.log('Successfully Transfer!');
    return ack(true);
  } catch (error) {
    await createErrorLog(error);
    console.error('Record error in MongoDB', error);
    ack(true);
  }
}

(async function () {
  await RabbitMQ.connect();
  await RabbitMQ.startPublish();
  await RabbitMQ.consumeQueue(DELAY_QUEUE, fnConsumer);
})();