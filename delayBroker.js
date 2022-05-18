require('dotenv').config({ path: __dirname + '/.env' });
const NotificationJobs = require('./utils/notificationJobs');
// const rabbitmq = require('./utils/rabbit');
const RabbitMQ = require('./utils/newRabbit');
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
    console.log(error);
    ack(false);
  }
}

// InitConnection of rabbitmq
// rabbitmq.initConnection(() => {
// start consumer worker when the connection to rabbitmq has been made
//   rabbitmq.consumeQueue(DELAY_QUEUE, fnConsumer);
// });

(async function () {
  await RabbitMQ.connect();
  await RabbitMQ.consumeQueue(DELAY_QUEUE, fnConsumer);
})();
