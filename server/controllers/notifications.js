const Content = require('../models/content');
const Notification = require('../models/notifications');
const SCHEDULED_TYPE = new Set(['realtime', 'scheduled']);
const SEND_TYPE = new Set(['webpush', 'websocket']);
const App = require('../models/apps');
const Cache = require('../../utils/cache');
const NotificationJobs = require('../../utils/notificationJobs');
const { generateValidDatetimeRange, diffFromNow } = require('../../utils/util');
const UPDATE_LIMITE_INTERVAL = 60 * 3; // only notification that is scheduled exceed 3 minutes from now can be update

const pushNotification = async (req, res) => {
  const { channel } = req.locals;
  const { scheduledType } = req.params;
  console.log(req.body);
  const { name, title, body, sendType, icon, config, sendTime } = req.body;
  console.log('Receive push notification:', name);
  console.log(channel);

  // Check scheduledType & sendType are valid types
  if (!scheduledType || !sendType || !SCHEDULED_TYPE.has(scheduledType) || !SEND_TYPE.has(sendType)) {
    res.status(400).send({ error: 'Wrong ScheduledType or SendType' });
    return;
  }

  // Check inputs
  if (!name || !title || !body) {
    res.status(400).send({ error: 'Wrong input' });
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
    sendTime: new Date(sendTime),
  };
  if (scheduledType === 'realtime') {
    NotificationJobs.handleRealtimeRequest(notification, channel);
  } else {
    NotificationJobs.handleScheduledRequest(notification, channel);
  }

  return res.status(200).json({ data: { id, status: 'success' } });
};

// Get all notifications
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

// Get notification by specific ID
const getNotificationById = async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Wrong ID' });
  }

  const notification = await Notification.getNotificationById(id);
  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  const content = await Content.findById(id, '-_id -__v -vapid_detail');
  notification.content = content;
  delete content._id;
  let sentTime = notification.scheduled_dt ? notification.scheduled_dt : notification.created_dt;
  sentTime = new Date(sentTime);
  const now = new Date();

  if (now.getTime() - sentTime.getTime() <= 60 * 60 * 2 * 1000) {
    const sent_odd = await Cache.hget('sentNum:odd', id);
    const sent_even = await Cache.hget('sentNum:even', id);
    const received_odd = await Cache.hget('receivedNum:odd', id);
    const received_even = await Cache.hget('receivedNum:even', id);
    notification.sent_num += parseInt(sent_odd || 0) + parseInt(sent_even || 0);
    notification.received_num += parseInt(received_odd || 0) + parseInt(received_even || 0);
    notification.updated_dt = now;
  }

  res.status(200).json({ data: notification });
  return;
};

// Check whether the notification could be update
// To update the notification, delete the origin one and create then new one
const checkUpdateAndDelete = async (req, res, next) => {
  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: 'Wrong ID' });
    return;
  }
  const notification = await Notification.getNotificationById(id);
  if (!notification) {
    res.status(404).json({ error: 'Notification not found' });
    return;
  }
  console.log();
  if (!notification.scheduled_dt || diffFromNow(notification.scheduled_dt) < UPDATE_LIMITE_INTERVAL) {
    res.status(400).json({ error: 'Notification can not be update' });
    return;
  }

  const deleteSuccess = await Notification.deleteNotification(id);
  if (deleteSuccess) {
    await Content.deleteOne({ _id: id });
  }
  req.params.scheduledType = 'scheduled';
  return next();
};

// Delete notification
const deleteNotification = async (req, res) => {
  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: 'Wrong ID' });
    return;
  }
  const deleteSuccess = await Notification.deleteNotification(id);
  if (deleteSuccess) {
    await Content.deleteOne({ _id: id });
    res.status(200).json({ status: 'success' });
    return;
  }
  res.status(404).json({ error: 'Notification not found' });
  return;
};

// Get notifications by app_id
const getNotificationsByApp = async (req, res, next) => {
  const { user } = req.session;
  let { app_id, start_date, end_date } = req.query;
  if (!app_id) {
    return next();
  }

  if (!start_date || !end_date) {
    res.status(400).json({ error: 'Get Notifications Error: Wrong Data Format' });
    return;
  }

  const verified = await App.verifyAppWithUser(user.id, app_id);
  if (!verified) {
    return res.status(400).json({ error: 'Wrong app_id' });
  }
  console.log('date:', start_date, end_date);
  [start_date, end_date] = generateValidDatetimeRange(start_date, end_date);
  console.log('date:', start_date, end_date);
  const data = await Notification.getNotificationByApp(app_id, start_date, end_date);
  console.log('select data', data);
  res.status(200).json({
    data,
  });
};

module.exports = {
  pushNotification,
  getNotifications,
  checkUpdateAndDelete,
  deleteNotification,
  getNotificationsByApp,
  getNotificationById,
};
