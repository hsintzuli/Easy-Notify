const Subscription = require('../server/models/subscriptions');
const Cache = require('./cache');
const rabbitmq = require('./rabbit');
const { REALTIME_EXCHANGE, DELAY_EXCHANGE, SCHEDULED_INTERVAL_HOUR, SEND_TO_SQS } = process.env;
const MAX_PUSH_CLIENT = parseInt(process.env.MAX_PUSH_CLIENT);
// const socket = require('./mysocket');
const Notification = require('../server/models/notifications');
const { diffFromNow } = require('./util');
const Content = require('../server/models/content');
const moment = require('moment');
const SQS = require('./sqs');

rabbitmq.initConnection(() => {
  console.log('Connect rabbitmq');
});

const handleRealtimeRequest = async (notification, channel) => {
  await Notification.createNotification(notification.id, channel.id, notification.name, notification.sendType);
  if (notification.sendType === 'websocket') {
    // generate websocket notification job
    await genWebsocketJob(notification.id, channel.id);
  } else {
    // Save vapidDetail to mongo
    const vapidDetail = {
      subject: `mailto:${channel.email}`,
      publicKey: channel.public_key,
      privateKey: channel.private_key,
    };
    const result = await Content.findOneAndUpdate({ _id: notification.id }, { vapid_detail: vapidDetail });
    console.log(result);

    // generate webpush notification job
    await genWebpushJob(notification.id, channel.id);
  }
};

const handleScheduledRequest = async (notification, channel) => {
  const delay = diffFromNow(notification.sendTime);
  console.log(delay);
  console.log('Handling Scheduled Job, Scheduled Time:', moment(notification.sendTime).format('YYYY-MM-DD HH:mm:ss'));

  // If delay time exceed SCHEDULED_INTERVAL_HOUR, just stay in db and not publish to delay exchange
  const notPublishToQueue = delay > parseInt(SCHEDULED_INTERVAL_HOUR) * 3600;
  console.log(parseInt(SCHEDULED_INTERVAL_HOUR) * 3600);
  await Notification.createNotification(notification.id, channel.id, notification.name, notification.sendType, notification.sendTime, notPublishToQueue);

  if (notification.sendType === 'webpush') {
    const vapidDetail = {
      subject: `mailto:${channel.email}`,
      publicKey: channel.public_key,
      privateKey: channel.private_key,
    };
    const result = await Content.findOneAndUpdate({ _id: notification.id }, { vapid_detail: vapidDetail });
    console.log(result);
  }
  if (notPublishToQueue) {
    return;
  }

  const job = { notificationId: notification.id, channelId: channel.id, sendType: notification.sendType };
  const jobOptions = {
    headers: { 'x-delay': delay * 1000 },
    contentType: 'application/json',
  };
  await rabbitmq.publishMessage(DELAY_EXCHANGE, '', JSON.stringify(job), jobOptions);
};

const genWebpushJob = async (notificationId, channelId) => {
  console.log('Generate job for websocket', notificationId);
  const job = { notificationId, channelId };
  const jobOptions = {
    contentType: 'application/json',
  };

  // Get subscribers form mysql and split to small job according to the numbers of subscribers
  const subscriptions = await Subscription.getClientIds(channelId);
  console.log(`Update notfication ${notificationId} with targets_num: `, subscriptions.length);
  await Notification.updateNotificationStatus(notificationId, { targets_num: subscriptions.length });

  if (subscriptions.length === 0) {
    console.log('No subscriber to this channel');
    await Notification.updateNotificationStatus(notificationId, { status: NOTIFICATION_STATUS.COMPLETE });
  }

  let i = 0;
  while (i < subscriptions.length) {
    let last = Math.min(subscriptions.length, i + MAX_PUSH_CLIENT);
    job.clients = subscriptions.slice(i, last).map((element) => element.id);
    console.log(job.clients);
    await Cache.hincrby('pushJobs', notificationId, 1);
    await rabbitmq.publishMessage(REALTIME_EXCHANGE, 'webpush', JSON.stringify(job), jobOptions);

    if (SEND_TO_SQS === 'true') {
      await SQS.sendMessage('Consume job on rabbitmq');
    }
    i = last;
  }
  return;
};

// Generate job for websocket notifcation
const genWebsocketJob = async (notificationId, channelId) => {
  console.log('Generate job for websocket', notificationId);
  const job = { notificationId, channelId };
  const jobOptions = {
    contentType: 'application/json',
  };

  // const clients = await Cache.hgetall(`clientNums{${channelId}}`);
  // const targets = Object.values(clients);
  // const targets_num = targets.reduce((prev, curr) => prev + parseInt(curr), 0);
  // console.log(`Update notfication ${notificationId} from websocket with targets_num: `, targets_num);
  // await Notification.updateNotificationStatus(notificationId, { targets_num });

  console.log(REALTIME_EXCHANGE, job);
  await rabbitmq.publishMessage(REALTIME_EXCHANGE, 'websocket', JSON.stringify(job), jobOptions);
  return true;
};

module.exports = {
  handleRealtimeRequest,
  handleScheduledRequest,
  genWebpushJob,
  genWebsocketJob,
};
