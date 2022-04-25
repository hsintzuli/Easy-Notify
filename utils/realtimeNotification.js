const Subscription = require('../server/models/subscriptions');
const Cache = require('./cache');
const rabbitmq = require('./rabbit');
const { REALTIME_EXCHANGE } = process.env;
const MAX_PUSH_CLIENT = parseInt(process.env.MAX_PUSH_CLIENT);
const socket = require('./mysocket');
const Notification = require('../server/models/notifications');

const genNotificationJob = async (notification_id, type, channel_id, vapidDetails, client_tags) => {
  console.log('get job', notification_id);
  const jobOptions = {
    contentType: 'application/json',
  };

  const job = { notification_id, channel_id };
  if (type === 'websocket') {
    const room = socket.getSocketsList(channel_id);
    console.log(`Update notfication ${notification_id} from web socketwith targets_num: `, room.size);
    await Notification.updateNotificationStatus(notification_id, { targets_num: room.size });

    console.log(REALTIME_EXCHANGE, job);
    await rabbitmq.publishMessage(REALTIME_EXCHANGE, type, JSON.stringify(job), jobOptions);
    return true;
  }
  job.vapidDetails = vapidDetails;
  const subscriptions = await Subscription.getClientIds(channel_id, client_tags);
  console.log(`Update notfication ${notification_id} from webpush socketwith targets_num: `, subscriptions.length);
  await Notification.updateNotificationStatus(notification_id, { targets_num: subscriptions.length });

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
