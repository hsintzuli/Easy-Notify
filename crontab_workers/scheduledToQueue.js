require('dotenv').config();
const rabbitmq = require('./../utils/rabbit');
const Content = require('./../server/models/content');
const moment = require('moment');
const { DELAY_EXCHANGE } = process.env;
const { pool } = require('./../server/models/mysqlcon');
const SCHEDULED_INTERVAL_HOUR = parseInt(process.env.SCHEDULED_INTERVAL_HOUR);
const { NOTIFICATION_STATUS } = require('./../server/models/notifications');
const _ = require('lodash');
const mongoose = require('mongoose');
const { MONGO_HOST, MONGO_USERNAME, MONGO_PASSWORD, MONGO_DATABASE } = process.env;
mongoose.connect(`mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}:27017/${MONGO_DATABASE}?authSource=admin`);

const mongodb = mongoose.connection;
mongodb.on('error', console.error.bind(console, 'connection error:'));
mongodb.once('open', function () {
  console.log('Connection Successful!');
});
const queryOfNotification = `SELECT id, channel_id, type, scheduled_dt FROM notifications 
                              WHERE status = ? AND scheduled_dt < DATE_ADD(NOW(), INTERVAL ? HOUR);`;
const queryOfChannel = `SELECT c.id, c.public_key, c.private_key, a.contact_email AS email FROM channels 
                              AS c  LEFT JOIN apps AS a on c.app_id = a.id 
                              WHERE c.id in (?);`;
const updateNotification = `UPDATE notifications SET status = ? WHERE id in (?)`;

const publishToDelayExchange = async () => {
  try {
    const [notifications] = await pool.query(queryOfNotification, [NOTIFICATION_STATUS.RECEIVED, SCHEDULED_INTERVAL_HOUR]);
    if (notifications.length === 0) {
      console.log('No scheduled notification moved to queue');
      return;
    }

    let notification_ids = [];
    let channel_ids = [];
    notifications.forEach((n) => {
      notification_ids.push(n.id);
      channel_ids.push(n.channel_id);
    });

    const [channels] = await pool.query(queryOfChannel, channel_ids);
    const channelsMap = _.groupBy(channels, (c) => c.id);
    console.log(channelsMap);

    for (let notification of notifications) {
      let channel = channelsMap[notification.channel_id];
      const vapidDetails = {
        subject: `mailto:${channel.email}`,
        publicKey: channel.public_key,
        privateKey: channel.private_key,
      };

      const time = new Date(notification.scheduled_dt);
      const delay = time.getTime() - Date.now();
      console.log('Scheduled Time', moment(time).format('YYYY-MM-DD HH:mm:ss'), 'Notification id:', notification.id);
      const jobOptions = {
        headers: { 'x-delay': delay },
        contentType: 'application/json',
      };
      const client_tags = await Content.findById(notification.id).select('client_tags');
      const newJob = { notification_id: notification.id, sendType: notification.type, vapidDetails, channel_id: channel.id, client_tags };
      await rabbitmq.publishMessage(DELAY_EXCHANGE, notification.type, JSON.stringify(newJob), jobOptions);
    }

    await pool.query(updateNotification, [NOTIFICATION_STATUS.ONQUEUE, notification_ids]);
  } catch (error) {
    console.log(error);
  } finally {
    await mongoose.disconnect();
    await pool.end();
    return process.exit(0);
  }
};

rabbitmq.connectToPublish(publishToDelayExchange);
