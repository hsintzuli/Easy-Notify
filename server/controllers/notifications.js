const Content = require('../models/content');
const Notification = require('../models/notifications');
const SCHEDULED_TYPE = new Set(['realtime', 'scheduled']);
const SEND_TYPE = new Set(['webpush', 'websocket']);
const App = require('../models/apps');
const Cache = require('../../utils/cache');
const NotificationJobs = require('../../utils/notificationJobs');
const { generateValidDatetimeRange } = require('../../utils/util');

const pushNotification = async (req, res) => {
  const { channel } = req.locals;
  const { scheduledType } = req.params;
  const { name, title, body, sendType, icon, config, sendTime } = req.body;
  console.log('Receive push notification:', name);

  // Check scheduledType & sendType are valid types
  if (!SCHEDULED_TYPE.has(scheduledType) || !SEND_TYPE.has(sendType)) {
    res.status(400).send({ error: 'Wrong ScheduledType or SendType' });
    return;
  }

  // Save notification content to Mongo DB and use _id of Mongo as notification id
  const content = new Content({
    title: title,
    body: body,
    config: config,
    icon: icon || channel.icon, // use channel icon as default icon
  });
  const mongoResult = await content.save();
  const id = mongoResult._id.toString();

  // Let NotificationJobs to handle realtime notification & scheduled notification respectively
  const notification = {
    id,
    name,
    sendType,
    scheduledType,
    sendTime,
  };
  if (scheduledType === 'realtime') {
    NotificationJobs.handleRealtimeRequest(notification, channel);
  } else {
    NotificationJobs.handleScheduledRequest(notification, channel);
  }

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
  const { user } = req.session;
  let { app_id, start_date, end_date } = req.query;
  if (!app_id) {
    return next();
  }

  if (!start_date || !end_date) {
    res.status(400).send({ error: 'Get Notifications Error: Wrong Data Format' });
    return;
  }

  const verified = await App.verifyAppWithUser(user.id, app_id);
  if (!verified) {
    return res.status(400).json({ error: 'Incorrect app_id' });
  }

  [start_date, end_date] = generateValidDatetimeRange(start_date, end_date);
  const data = await Notification.getNotificationByApp(app_id, start_date, end_date);
  console.log('select data', data);
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
