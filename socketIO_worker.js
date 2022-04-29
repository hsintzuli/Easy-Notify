require('dotenv').config({ path: __dirname + '/.env' });
const rabbitmqLib = require('./utils/rabbit');
const Notification = require('./server/models/notifications');
const { NOTIFICATION_STATUS } = Notification;
const Content = require('./server/models/content');
const Cache = require('./utils/cache');
const { WEBSOCKET_QUEUE, SOCKET_TOKEN, SOCKETIO_PORT } = process.env;
const { io } = require('socket.io-client');
const Mongo = require('./server/models/mongoconn');
const { getCheckHour } = require('./utils/util');
Mongo.connect();
// Initialize socketIO client
const socket = io(`http://localhost:${SOCKETIO_PORT}`, {
  auth: {
    token: SOCKET_TOKEN,
  },
});

socket.on('connect', async () => {
  const engine = socket.io.engine;
  console.log('[SocketIO] Connect to socket server, connect in', engine.transport.name);

  engine.once('upgrade', () => {
    console.log('[SocketIO] Connection upgrade, connect in', engine.transport.name);
  });

  engine.on('close', (reason) => {
    // called when the underlying connection is closed
    console.log('[SocketIO] Connection closed', reason);
  });

  socket.on('connection', async (data) => {
    console.log(data);
  });

  socket.on('ack', async (data) => {
    let { notificationId, clientsNum } = data;
    let hourToCheck = getCheckHour(false);
    await Cache.hset(`sentNum:${hourToCheck}`, notificationId, clientsNum);
    await Notification.updateNotificationStatus(notificationId, { status: NOTIFICATION_STATUS.COMPLETE });
  });
});

async function fnConsumer(msg, ack) {
  const { notificationId, channelId } = JSON.parse(msg.content);
  console.log('Websocket worker receive job', notificationId);

  try {
    // Update notification status in mysql
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
    socket.emit('push', { roomId: channelId, payload });
    console.log('send msg to', channelId);
    ack(true);
  } catch (error) {
    console.error(error);
    ack(false);
  }
}

const initializSocketWorker = () => {
  rabbitmqLib.initConnection(() => {
    // start socket worker when the connection to rabbitmq has been made
    console.log('Start Socketworker');
    rabbitmqLib.consumeQueue(WEBSOCKET_QUEUE, fnConsumer);
  });
};
initializSocketWorker();
// module.exports = { initializSocketWorker };
