const webpush = require('web-push');
const rabbitmqLib = require('../../utils/rabbit');
const business_model = require('../models/business');
const notification_model = require('../models/notification');
const Content = require('../models/content');
const { DELAY_EXCHANGE } = process.env;
const moment = require('moment');
let id = 0;

// InitConnection of rabbitmq
rabbitmqLib.initConnection(() => {
  // start Publisher when the connection to rabbitmq has been made
  rabbitmqLib.startPublish();
});

// Push notification
const pushNotification = async (req, res) => {
  const scheduled = req.params.scheduledType === 'scheduled';
  const { appID, payload, sendType, sendTime, ttl } = req.body;
  const businessInfo = await business_model.getBusinessByID(appID);
  const type = sendType === 'webpush' ? 'webpush' : 'websocket';

  let delay = 0;
  let time;
  if (scheduled) {
	  console.log('sendTime', sendTime);
    time = new Date(sendTime);
    console.log('Scheduled Time', time);
    delay = time.getTime() - Date.now();
    time = moment(time).format('YYYY-MM-DD HH:mm:ss');
  }

  console.log('delay', delay.toString());
  const jobOptions = {
    headers: { 'x-delay': delay.toString() },
    contentType: 'application/json',
  };

  console.log(payload);
  const vapidDetails = {
    subject: `mailto:${businessInfo.email}`,
    publicKey: businessInfo.public_key,
    privateKey: businessInfo.private_key,
  };
  const content = new Content({
    title: payload.title,
    body: payload.message,
    ttl: ttl,
  });
  const mongoResult = await content.save();
  const newJob = { contentID: mongoResult._id, vapidDetails, appID };

  console.log('Create job', jobOptions);
  await rabbitmqLib.publishMessage(DELAY_EXCHANGE, type, JSON.stringify(newJob), jobOptions);
  await notification_model.createNotification(mongoResult._id, appID, type, scheduled, time);
  res.status(201).json(mongoResult);
  return;
};

module.exports = {
  pushNotification,
};
