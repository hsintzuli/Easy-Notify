const rabbitmq = require('../../utils/rabbit');
const Notification = require('../models/notifications');
const Content = require('../models/content');
const { DELAY_EXCHANGE } = process.env;
const { genNotificationJob } = require('../../utils/realtimeNotification');
const SCHEDULED_TYPE = new Set(['realtime', 'scheduled']);
const SEND_TYPE = new Set(['webpush', 'websocket']);
const moment = require('moment');

// Push notification
const pushNotification = async (req, res) => {
  const { channel } = req.locals;
  const { scheduledType } = req.params;
  const { title, body, sendType, optionContent, config, sendTime, client_tags } = req.body;

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
  });

  const mongoResult = await content.save();

  if (scheduledType === 'scheduled') {
    const time = new Date(sendTime);
    const delay = time.getTime() - Date.now();
    console.log('Scheduled Time', moment(time).format('YYYY-MM-DD HH:mm:ss'));
    const jobOptions = {
      headers: { 'x-delay': delay },
      contentType: 'application/json',
    };
    const newJob = { notification_id: mongoResult._id, sendType, vapidDetails, channel_id: channel.id, client_tags };
    await Notification.createNotification(mongoResult._id, channel.id, sendType, time);
    await rabbitmq.publishMessage(DELAY_EXCHANGE, sendType, JSON.stringify(newJob), jobOptions);
    return res.status(200).json(mongoResult);
  }

  await Notification.createNotification(mongoResult._id, channel.id, sendType);
  await genNotificationJob(mongoResult._id, sendType, channel.id, vapidDetails, client_tags);
  return res.status(200).json(mongoResult);
};

const getNotification = async (req, res) => {
  const { channel } = req.locals;
  const { id } = req.query;
  if (id) {
    const notification = await Notification.getNotificationBYId(id);
    const content = await Content.findById(id, '-_id -__v');
    delete content._id;
    notification.content = content;
    res.status(200).json({ data: notification });
    return;
  }

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

module.exports = {
  pushNotification,
  getNotification,
  updateNotification,
  deleteNotification,
};
