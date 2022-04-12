require('dotenv').config();
const webpush = require('web-push');
const rabbitmqLib = require('./utils/rabbit');
const Content = require('./server/models/content');
const subscribe = require('./server/models/subscription');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const { MONGO_HOST, MONGO_USERNAME, MONGO_PASSWORD, MONGO_DATABASE } = process.env;

mongoose.connect(`mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}:27017/${MONGO_DATABASE}?authSource=admin`);

const mongodb = mongoose.connection;
mongodb.on('error', console.error.bind(console, 'connection error:'));
mongodb.once('open', function () {
  console.log('Connection Successful!');
});

const { WEBPUSH_QUEUE } = process.env;

async function fnConsumer(msg, callback) {
  const { contentID, vapidDetails, appID } = JSON.parse(msg.content);
  // id = ObjectId(contentID);
  console.log('id', contentID);

  const result = await Content.findById(contentID);
  const subscribes = await subscribe.getClients(appID);
  const payload = {
    title: result.title,
    body: result.body,
  };
  const option = {
    vapidDetails,
    TTL: subscribes.ttl,
  };
  console.log('Received message: ', result);
  for (let sub of subscribes) {
    let subscription = {
      endpoint: sub.endpoint,
      keys: JSON.parse(sub.keys),
    };
    await webpush.sendNotification(subscription, JSON.stringify(payload), option).catch((err) => console.error(err));
  }
  // we tell rabbitmq that the message was processed successfully
  callback(true);
}

// InitConnection of rabbitmq
rabbitmqLib.initConnection(() => {
  // start consumer worker when the connection to rabbitmq has been made
  rabbitmqLib.consumeQueue(WEBPUSH_QUEUE, fnConsumer);
});
