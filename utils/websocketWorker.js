require('dotenv').config();
const socket = require('./mysocket');
const rabbitmqLib = require('./rabbit');
const Notification = require('../server/models/notifications');
const { NOTIFICATION_STATUS } = Notification;
const Content = require('../server/models/content');
const { WEBSOCKET_QUEUE } = process.env;

async function fnConsumer(msg, callback) {
  const { notification_id, channel_id } = JSON.parse(msg.content);
  console.log('notification_id', notification_id);
  const updated = await Notification.updateNotificationStatus(notification_id, { status: NOTIFICATION_STATUS.DELEVERED });
  if (!updated) {
    console.log(`Notification ${notification_id} has been deleted before delevered`);
    return callback(true);
  }
  const msgContent = await Content.findById(notification_id);

  const payload = {
    title: msgContent.title,
    body: msgContent.body,
    notification_id: notification_id,
    option_content: msgContent.option_content,
    config: msgContent.config,
  };
  socket.sendMsg(channel_id, payload);
  console.log('send msg to', channel_id);
  await Notification.updateNotificationStatus(notification_id, { status: NOTIFICATION_STATUS.COMPLETE });

  //tell rabbitmq that the message was processed successfully
  callback(true);
}

const initializSocketWorker = () => {
  rabbitmqLib.initConnection(() => {
    // start socket worker when the connection to rabbitmq has been made
    console.log('Start Socketworker');
    rabbitmqLib.consumeQueue(WEBSOCKET_QUEUE, fnConsumer);
  });
};

module.exports = { initializSocketWorker };
