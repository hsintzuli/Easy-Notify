require('dotenv').config({ path: __dirname + '/.env' });
const webpush = require('web-push');
const rabbitmq = require('./utils/rabbit');
const Cache = require('./utils/cache');
const Content = require('./server/models/content');
const Notification = require('./server/models/notifications');
const Subscription = require('./server/models/subscriptions');
const mongoose = require('mongoose');
const { WEBPUSH_QUEUE } = process.env;
const { MONGO_HOST, MONGO_USERNAME, MONGO_PASSWORD, MONGO_DATABASE } = process.env;
const { NOTIFICATION_STATUS } = Notification;

mongoose.connect(`mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}:27017/${MONGO_DATABASE}?authSource=admin`);

const mongodb = mongoose.connection;
mongodb.on('error', console.error.bind(console, 'connection error:'));
mongodb.once('open', function () {
  console.log('Connection Successful!');
});

async function fnConsumer(msg, callback) {
  const { notification_id, channel_id, vapidDetails, clients } = JSON.parse(msg.content);
  console.log('NotificationID', notification_id);
  const updated = await Notification.updateNotificationStatus(notification_id, { status: NOTIFICATION_STATUS.DELEVERED });
  if (!updated) {
    console.log(`Notification ${notification_id} has been deleted before delevered`);
    return callback(true);
  }
  const msgContent = await Content.findById(notification_id);
  const payload = {
    title: msgContent.title,
    body: msgContent.body,
    notification_id: notification_id,
    option_content: msgContent.option_content,
    config: msgContent.config,
  };
  const pushOption = {
    vapidDetails,
    TTL: 5,
  };
  console.log('Received message: ', msgContent);
  console.log('clients', clients);
  const subscriptions = await Subscription.getClientDetailByIds(clients);
  console.log('subscriptions', subscriptions);
  for (let subscription of subscriptions) {
    const client = {
      endpoint: subscription.endpoint,
      keys: JSON.parse(subscription.keys),
    };
    try {
      await webpush.sendNotification(client, JSON.stringify(payload), pushOption);
      await Cache.hincrby('sentNums', notification_id, 1);
    } catch (error) {
      console.error(error);
    }
  }

  const leavingJobs = await Cache.hincrby('pushJobs', notification_id, -1);
  if (leavingJobs === 0) {
    await Notification.updateNotificationStatus(notification_id, { status: NOTIFICATION_STATUS.COMPLETE });
    await Cache.hdel('pushJobs', notification_id);
    console.log(`Finish ${notification_id}, successfully update mysql & delete redis`);
  }
  callback(true);
}

// InitConnection of rabbitmq
rabbitmq.initConnection(() => {
  // start consumer worker when the connection to rabbitmq has been made
  rabbitmq.consumeQueue(WEBPUSH_QUEUE, fnConsumer);
});
