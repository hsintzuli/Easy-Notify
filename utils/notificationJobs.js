const Subscription = require('../server/models/subscriptions');
const Cache = require('./cache');
const { REALTIME_EXCHANGE, DELAY_EXCHANGE, SCHEDULED_INTERVAL_HOUR, SEND_TO_SQS } = process.env;
const MAX_PUSH_CLIENT = parseInt(process.env.MAX_PUSH_CLIENT); // The maximum numbers of clients in one webpush job
const Notification = require('../server/models/notifications');
const { diffFromNow } = require('./timeUtils');
const Content = require('../server/models/content');
const moment = require('moment');
const SQS = require('./sqs');
const RabbitMQ = require('./rabbit');

const handleRealtimeRequest = async (notification, channel) => {
  await Notification.createNotification(notification.id, channel.id, notification.name, notification.sendType);
  console.info('[handleRealtimeRequest] Handling Realtime Job');
  if (notification.sendType === 'websocket') {
    await genWebsocketJob(notification.id, channel.id);
  } else {
    // Save vapidDetail to mongo
    await Content.updateVapidDetail(notification.id, channel.email, channel.public_key, channel.private_key);
    await genWebpushJob(notification.id, channel.id);
  }
};

const handleScheduledRequest = async (notification, channel) => {
  const delay = diffFromNow(notification.sendTime);
  console.info('[handleScheduledRequest] Handling Scheduled Job, Scheduled Time: %s', moment(notification.sendTime).format('YYYY-MM-DD HH:mm:ss'));

  // If delay time exceed SCHEDULED_INTERVAL_HOUR, just stay in db and not publish to delay exchange
  const notPublishToQueue = delay > parseInt(SCHEDULED_INTERVAL_HOUR) * 3600;
  await Notification.createNotification(notification.id, channel.id, notification.name, notification.sendType, notification.sendTime, notPublishToQueue);

  // Save vapidDetail to mongo
  await Content.updateVapidDetail(notification.id, channel.email, channel.public_key, channel.private_key);
  if (notPublishToQueue) {
    return;
  }

  const job = { notificationId: notification.id, channelId: channel.id, sendType: notification.sendType };
  const jobOptions = {
    headers: { 'x-delay': delay * 1000 },
    contentType: 'application/json',
  };
  await RabbitMQ.publishMessage(DELAY_EXCHANGE, '', JSON.stringify(job), jobOptions);
};

// Generate job for webpush notifcation
const genWebpushJob = async (notificationId, channelId) => {
  console.info('[genWebpushJob] Generate job for webpush with notification id: %s', notificationId);
  const job = { notificationId, channelId };
  const jobOptions = {
    contentType: 'application/json',
  };

  // Get subscribers form mysql and split to small job according to the numbers of subscribers
  const subscriptions = await Subscription.getClientIds(channelId);
  console.debug(`[genWebpushJob] Update notfication ${notificationId} with targets_num: %s`, subscriptions.length);
  await Notification.updateNotificationStatus(notificationId, { targets_num: subscriptions.length });

  if (subscriptions.length === 0) {
    console.debug('[genWebpushJob] No subscriber to the channel with id: %s', channelId);
    await Notification.updateNotificationStatus(notificationId, { status: Notification.NOTIFICATION_STATUS.COMPLETE });
    return;
  }

  await splitJobToPublish(notificationId, job, jobOptions, subscriptions);
};

// Generate job for websocket notifcation
const genWebsocketJob = async (notificationId, channelId) => {
  console.info('[genWebsocketJob] Generate job for websocket with notification id: %s', notificationId);
  const job = { notificationId, channelId };
  const jobOptions = {
    contentType: 'application/json',
  };

  await RabbitMQ.publishMessage(REALTIME_EXCHANGE, 'websocket', JSON.stringify(job), jobOptions);
  return true;
};

const splitJobToPublish = async (notificationId, job, jobOptions, subscriptions) => {
  let i = 0;
  while (i < subscriptions.length) {
    let last = Math.min(subscriptions.length, i + MAX_PUSH_CLIENT);
    job.clients = subscriptions.slice(i, last).map((element) => element.id);
    await Cache.hincrby('pushJobs', notificationId, 1);
    await RabbitMQ.publishMessage(REALTIME_EXCHANGE, 'webpush', JSON.stringify(job), jobOptions);

    if (SEND_TO_SQS === 'true') {
      await SQS.sendMessage('Consume job on rabbitmq');
    }
    i = last;
  }
  return;
};

module.exports = {
  handleRealtimeRequest,
  handleScheduledRequest,
  genWebpushJob,
  genWebsocketJob,
};
