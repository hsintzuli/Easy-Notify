require('dotenv').config({ path: __dirname + '/.env' });
const { genNotificationJob } = require('./utils/realtimeNotification');
const rabbitmq = require('./utils/rabbit');
const { DELAY_QUEUE } = process.env;
async function fnConsumer(msg, callback) {
  try {
    const job = JSON.parse(msg.content.toString());
    console.log(job);
    await genNotificationJob(job.notification_id, job.sendType, job.channel_id, job.vapidDetails, job.client_tags);
    console.log('Success update notification status');
    return callback(true);
  } catch (error) {
    console.log(error);
    callback(false);
  }
}

// InitConnection of rabbitmq
rabbitmq.initConnection(() => {
  // start consumer worker when the connection to rabbitmq has been made
  rabbitmq.consumeQueue(DELAY_QUEUE, fnConsumer);
});
