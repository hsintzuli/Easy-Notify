require('dotenv').config({ path: __dirname + '/.env' });
const socket = require('./mysocket');
const rabbitmqLib = require('./rabbit');
const Content = require('../server/models/content');
const mongoose = require('mongoose');
// const { MONGO_HOST, MONGO_USERNAME, MONGO_PASSWORD, MONGO_DATABASE } = process.env;

// mongoose.connect(`mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}:27017/${MONGO_DATABASE}?authSource=admin`);

// const mongodb = mongoose.connection;
// mongodb.on('error', console.error.bind(console, 'connection error:'));
// mongodb.once('open', function () {
//   console.log('Connection Successful!');
// });

const { WEBSOCKET_QUEUE } = process.env;

async function fnConsumer(msg, callback) {
  const { contentID, vapidDetails, appID } = JSON.parse(msg.content);
  // id = ObjectId(contentID);
  console.log('id', contentID);

  const result = await Content.findById(contentID);
  const payload = {
    title: result.title,
    body: result.body,
  };
  socket.sendMsg(appID, payload);
  console.log('send msg!');
  // we tell rabbitmq that the message was processed successfully
  callback(true);
}

const initializSocketWorker = () => {
  // InitConnection of rabbitmq
  rabbitmqLib.initConnection(() => {
    // start consumer worker when the connection to rabbitmq has been made
    console.log('Start');
    rabbitmqLib.consumeQueue(WEBSOCKET_QUEUE, fnConsumer);
  });
};

// // InitConnection of rabbitmq
// rabbitmqLib.initConnection(() => {
//   // start consumer worker when the connection to rabbitmq has been made
//   rabbitmqLib.consumeQueue(WEBSOCKET_QUEUE, fnConsumer);
// });

module.exports = { initializSocketWorker };
