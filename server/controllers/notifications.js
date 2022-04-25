const rabbitmq = require('../../utils/rabbit');
const Content = require('../models/content');
const { genNotificationJob } = require('../../utils/realtimeNotification');
const moment = require('moment');
const { DELAY_EXCHANGE, SCHEDULED_INTERVAL_HOUR } = process.env;
const Notification = require('../models/notifications');
const { NOTIFICATION_STATUS } = Notification;
const SCHEDULED_TYPE = new Set(['realtime', 'scheduled']);
const SEND_TYPE = new Set(['webpush', 'websocket']);
const App = require('../models/apps');
const Cache = require('../../utils/cache');

// Push notification
const pushNotification = async (req, res) => {
  const { channel } = req.locals;
  const { scheduledType } = req.params;
  const { name, title, body, sendType, optionContent, config, sendTime, client_tags } = req.body;

  console.log('Receive notification');
  if (!SCHEDULED_TYPE.has(scheduledType) || !SEND_TYPE.has(sendType)) {
    res.status(400).send({ error: 'Wrong Request' });
    return;
  }
  const vapidDetails = {
    subject: `mailto:${channel.email}`,
    publicKey: channel.public_key,
    privateKey: channel.private_key,
  };

  const content = new Content({
    title: title,
    body: body,
    option_content: optionContent,
    config: config,
    client_tags: client_tags,
  });

  const mongoResult = await content.save();
  const id = mongoResult._id.toString();

  const notification = {
    id: id,
    name: name,
  };
  if (scheduledType === 'realtime') {
    await Notification.createNotification(id, channel.id, name, sendType);
    await genNotificationJob(id, sendType, channel.id, vapidDetails, client_tags);
    return res.status(200).json({ data: notification });
  }

  const time = new Date(sendTime);
  const now = new Date();
  const delay = time.getTime() - now.getTime();
  const notPublishToQueue = delay > SCHEDULED_INTERVAL_HOUR * 3600 * 1000;
  await Notification.createNotification(mongoResult._id, channel.id, name, sendType, time, notPublishToQueue);

  if (notPublishToQueue) {
    return res.status(200).json({ data: notification });
  }

  console.log('Scheduled Time', moment(time).format('YYYY-MM-DD HH:mm:ss'));
  const jobOptions = {
    headers: { 'x-delay': delay },
    contentType: 'application/json',
  };
  const newJob = { notification_id: mongoResult._id, sendType, vapidDetails, channel_id: channel.id, client_tags };
  await rabbitmq.publishMessage(DELAY_EXCHANGE, sendType, JSON.stringify(newJob), jobOptions);
  return res.status(200).json({ data: notification });
};

const getNotifications = async (req, res, next) => {
  const { id } = req.query;
  if (id) {
    return next();
  }

  const { channel } = req.locals;
  const notifications = await Notification.getNotifications(channel.id);
  const notification_ids = notifications.map((element) => element.id);
  let contents = await Content.find({ _id: { $in: notification_ids } }, '-__v');
  contents = contents.reduce((prev, curr) => {
    let { _id, ...content } = curr._doc;
    prev[_id] = content;
    return prev;
  }, {});
  notifications.forEach((element) => {
    element.content = contents[element.id];
  });
  res.status(200).json({ data: notifications });
  return;
};

const getNotificationById = async (req, res) => {
  const { id } = req.query;
  const notification = await Notification.getNotificationById(id);
  if (!notification) {
    return res.status(400).json({ error: 'Wrong Request' });
  }

  const content = await Content.findById(id, '-_id -__v');
  notification.content = content;
  delete content._id;
  let sentTime = notification.scheduled_dt ? notification.scheduled_dt : notification.created_dt;
  sentTime = new Date(sentTime);
  const now = new Date();

  if (now.getTime() - sentTime.getTime() <= 60 * 60 * 2 * 1000) {
    const sent_num = await Cache.hget('sentNums', id);
    const received_odd = await Cache.hget('receivedNum:odd', id);
    const received_even = await Cache.hget('receivedNum:even', id);
    const targets_num = await Cache.hget('receivedNum:even', id);
    notification.sent_num += parseInt(sent_num || 0);
    notification.received_num += parseInt(received_odd || 0) + parseInt(received_even || 0);
    notification.targets_num += parseInt(targets_num || 0);
    notification.updated_dt = now;
  }

  res.status(200).json({ data: notification });
  return;
};

const updateNotification = async (req, res) => {
  const { id } = req.query;
  const { title, body, options, config } = req.body;
  const content = {
    title: title,
    body: body,
    option_content: options,
    config: config,
  };
  const updateSuccess = await Content.findByIdAndUpdate({ _id: id }, content);
  console.log(updateSuccess);
  res.status(200).json({ status: 'success' });
  return;
};

const deleteNotification = async (req, res) => {
  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: 'Wrong Request' });
    return;
  }
  const deleteSuccess = await Notification.deleteNotification(id);
  if (deleteSuccess) {
    await Content.deleteOne({ _id: id });
    res.status(200).json({ status: 'success' });
    return;
  }
  res.status(201).json({ status: 'failed' });
  return;
};

const getNotificationsByApp = async (req, res, next) => {
  console.log(req.query);
  if (!req.query.app_id) {
    return next();
  }
  const { user } = req.session;
  let { app_id, start_date, end_date } = req.query;
  const verified = await App.verifyAppWithUser(user.id, app_id);
  if (!verified) {
    return res.status(400).json({ error: 'Incorrect user or channel id' });
  }

  if (!start_date || !end_date) {
    res.status(400).send({ error: 'Get New Subscribers Error: Wrong Data Format' });
    return;
  }
  start_date = new Date(start_date);
  end_date = new Date(end_date);
  let now = new Date();
  console.log(start_date);
  console.log(end_date);
  if (moment(end_date).format('YYYY-MM-DD') === moment(now).format('YYYY-MM-DD')) {
    end_date = now;
  } else {
    end_date = new Date(end_date.getTime() + (23 * 3600 + 59 * 60) * 1000);
  }

  const data = await Notification.getNotificationByApp(app_id, start_date, end_date);
  console.log(data);
  res.status(200).send({
    data,
  });
};

module.exports = {
  pushNotification,
  getNotifications,
  updateNotification,
  deleteNotification,
  getNotificationsByApp,
  getNotificationById,
};
