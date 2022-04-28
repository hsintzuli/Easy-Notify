require('dotenv').config();
const socket = require('./mysocket');
const rabbitmqLib = require('./rabbit');
const Notification = require('../server/models/notifications');
const { NOTIFICATION_STATUS } = Notification;
const Content = require('../server/models/content');
const Cache = require('./cache');
const { WEBSOCKET_QUEUE } = process.env;

async function fnConsumer(msg, ack) {
  const { notificationId, channelId } = JSON.parse(msg.content);
  console.log('Websocket worker receive job', notificationId);

  // Update notification status in ,ysql
  const updated = await Notification.updateNotificationStatus(notificationId, { status: NOTIFICATION_STATUS.DELEVERED });
  if (!updated) {
    console.log(`Notification ${notificationId} has been deleted before delevered`);
    return callback(true);
  }
  const msgContent = await Content.findById(notificationId);
  const payload = {
    notification_id: notificationId,
    title: msgContent.title,
    body: msgContent.body,
    icon: msgContent.icon,
    config: msgContent.config,
  };
  socket.sendMsg(channelId, payload);
  console.log('send msg to', channelId);
  const clients = socket.getSocketsList(channelId);
  const sentNum = clients ? clients.size : 0;
  await Cache.hincrby('sentNums', channelId, sentNum);

  await Notification.updateNotificationStatus(channelId, { status: NOTIFICATION_STATUS.COMPLETE });

  //tell rabbitmq that the message was processed successfully
  ack(true);
}

const initializSocketWorker = () => {
  rabbitmqLib.initConnection(() => {
    // start socket worker when the connection to rabbitmq has been made
    console.log('Start Socketworker');
    rabbitmqLib.consumeQueue(WEBSOCKET_QUEUE, fnConsumer);
  });
};

module.exports = { initializSocketWorker };
