require('dotenv').config({ path: __dirname + '/../.env' });
const webpush = require('web-push');
const Cache = require('../utils/cache');
const Content = require('../server/models/content');
const Notification = require('../server/models/notifications');
const Subscription = require('../server/models/subscriptions');
const { WEBPUSH_QUEUE } = process.env;
const { NOTIFICATION_STATUS } = Notification;
const { getCheckHour } = require('../utils/timeUtils');
const DEFAULT_TTL = 5;
require('../server/models/mongoconn').connect();
const RabbitMQ = require('../utils/rabbit');

async function fnConsumer(msg, ack) {
  const { notificationId, channelId, clients } = JSON.parse(msg.content);
  console.log('Webpush worker receive job', notificationId);

  try {
    const updated = await Notification.updateNotificationStatus(notificationId, { status: NOTIFICATION_STATUS.DELEVERED });
    if (!updated) {
      console.log(`Notification ${notificationId} has been deleted before delevered`);
      return ack(true);
    }
    const msgContent = await Content.findById(notificationId);
    const payload = {
      notification_id: notificationId,
      title: msgContent.title,
      body: msgContent.body,
      icon: msgContent.icon,
      config: msgContent.config,
    };
    const pushOption = {
      vapidDetails: msgContent.vapid_detail,
      TTL: DEFAULT_TTL,
    };
    console.log('Start to push notification through webpush:', payload);
    const subscriptions = await Subscription.getClientDetailByIds(clients);
    console.log('Target clients', subscriptions);
    for (let subscription of subscriptions) {
      const client = {
        endpoint: subscription.endpoint,
        keys: JSON.parse(subscription.keys),
      };
      try {
        await webpush.sendNotification(client, JSON.stringify(payload), pushOption);
        let hourToCheck = getCheckHour(false);
        await Cache.hincrby(`sentNum:${hourToCheck}`, notificationId, 1);
      } catch (error) {
        console.error(error);
      }
    }

    const leavingJobs = await Cache.hincrby('pushJobs', notificationId, -1);
    if (leavingJobs === 0) {
      await Notification.updateNotificationStatus(notificationId, { status: NOTIFICATION_STATUS.COMPLETE });
      await Cache.del('pushJobs', notificationId);
      console.log(`Finish ${notificationId}, successfully update mysql & delete redis`);
    }
    ack(true);
  } catch (error) {
    console.log(error);
    ack(false);
  }
}

(async function () {
  await RabbitMQ.connect();
  await RabbitMQ.consumeQueue(WEBPUSH_QUEUE, fnConsumer);
})();
