const rabbitmq = require('../../utils/rabbit');
const Notification = require('../models/notification');
const Content = require('../models/content');
const { DELAY_EXCHANGE } = process.env;
const SCHEDULED_TYPE = new Set(['realtime', 'scheduled']);
const moment = require('moment');

// Push notification
const pushNotification = async (req, res) => {
  const { scheduledType } = req.params;
  console.log(SCHEDULED_TYPE);
  if (!SCHEDULED_TYPE.has(scheduledType)) {
    res.status(400).send({ error: 'Wrong Request' });
    return;
  }
  const { channel } = req.locals;
  const { title, body, sendType, options, config, sendTime } = req.body;
  const scheduled = scheduledType === 'scheduled';
  const type = sendType === 'webpush' ? 'webpush' : 'websocket';

  let delay = 0;
  let time;
  if (scheduled) {
    time = new Date(sendTime);
    console.log('Scheduled Time', moment(time).format('YYYY-MM-DD HH:mm:ss'));
    delay = time.getTime() - Date.now();
  }

  const jobOptions = {
    headers: { 'x-delay': delay },
    contentType: 'application/json',
  };

  const vapidDetails = {
    subject: `mailto:${channel.email}`,
    publicKey: channel.public_key,
    privateKey: channel.private_key,
  };

  const content = new Content({
    title: title,
    body: body,
    option_content: options,
    config: config,
  });

  const mongoResult = await content.save();
  const newJob = { contentID: mongoResult._id, vapidDetails, channel_id: channel.id };

  console.log('Create job', newJob);
  await Notification.createNotification(mongoResult._id, channel.id, type, time);
  await rabbitmq.publishMessage(DELAY_EXCHANGE, type, JSON.stringify(newJob), jobOptions);
  res.status(201).json(mongoResult);
  return;
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

  let notifications = await Notification.getNotifications(channel.id);
  let notification_ids = notifications.map((element) => element.id);
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
