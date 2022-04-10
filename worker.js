require('dotenv').config({ path: __dirname + '/.env' });
const webpush = require('web-push');
const rabbitmqLib = require('./utils/rabbit');
const { DELAY_QUEUE } = process.env;

function fnConsumer(msg, callback) {
  const { subscription, payload, option } = JSON.parse(msg.content);
  console.log('Received message: ', payload);

  webpush.sendNotification(subscription, JSON.stringify(payload), option).catch((err) => console.error(err));
  // we tell rabbitmq that the message was processed successfully
  callback(true);
}

// InitConnection of rabbitmq
rabbitmqLib.initConnection(() => {
  // start consumer worker when the connection to rabbitmq has been made
  rabbitmqLib.consumeQueue(DELAY_QUEUE, fnConsumer);
});
