const Subscription = require('../server/models/subscriptions');
const Cache = require('./cache');
const rabbitmq = require('./rabbit');
const { REALTIME_EXCHANGE } = process.env;
const MAX_PUSH_CLIENT = parseInt(process.env.MAX_PUSH_CLIENT);

const genNotificationJob = async (notification_id, type, channel_id, vapidDetails, client_tags) => {
  console.log('get job', client_tags);
  const jobOptions = {
    contentType: 'application/json',
  };

  const job = { notification_id, channel_id };
  if (type === 'websocket') {
    console.log(REALTIME_EXCHANGE, job);
    await rabbitmq.publishMessage(REALTIME_EXCHANGE, type, JSON.stringify(job), jobOptions);
    return true;
  }
  job.vapidDetails = vapidDetails;
  const subscriptions = await Subscription.getClientIds(channel_id, client_tags);
  for (let i = 0; i < subscriptions.length; i += MAX_PUSH_CLIENT) {
    let last = Math.min(subscriptions.length, i + MAX_PUSH_CLIENT);
    console.log(last);
    job.clients = subscriptions.slice(i, last).map((element) => element.id);
    console.log(job.clients);
    await Cache.hincrby('pushJobs', job.notification_id, 1);
    await rabbitmq.publishMessage(REALTIME_EXCHANGE, type, JSON.stringify(job), jobOptions);
  }
  return;
};

module.exports = {
  genNotificationJob,
};
