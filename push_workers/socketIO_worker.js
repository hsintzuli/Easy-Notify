require('dotenv').config({ path: __dirname + '/../.env' });
const { WEBSOCKET_QUEUE, SOCKET_TOKEN, WORKERS_ERROR_FILE_PATH } = process.env;
const logger = require('../logger/index').setLogger(WORKERS_ERROR_FILE_PATH);
const Notification = require('../server/models/notifications');
const { NOTIFICATION_STATUS } = Notification;
const Content = require('../server/models/content');
const Cache = require('../utils/cache');
const { io } = require('socket.io-client');
const { getCheckHour } = require('../utils/timeUtils');
const { createErrorLog } = require('../server/models/notificationErrorLog');
const RabbitMQ = require('../utils/rabbit');
require('../server/models/mongoconn').connect();

// Initialize socketIO client with admin token
const socket = io('https://notify.easynotify.site', {
  auth: {
    token: SOCKET_TOKEN,
  },
});

socket.on('connect', async () => {
  const engine = socket.io.engine;
  console.info('[SocketIO] Connect to socket server, connect in %s', engine.transport.name);

  engine.once('upgrade', () => {
    console.info('[SocketIO] Connection upgrade, connect in %s', engine.transport.name);
  });

  engine.on('close', (reason) => {
    // called when the underlying connection is closed
    console.warn('[SocketIO] Connection closed %o', reason);
  });

  socket.on('connection', async (data) => {
    console.debug('[SocketIO] on connection: %o', data);
  });

  socket.on('roomNums', async (data) => {
    const { roomId, notificationId, clientsNum } = data;
    console.debug(`[SocketIO] Receive the numbers of clients in channel ${roomId} from socket server: ${clientsNum}`);
    try {
      await Notification.updateNotificationTargetsNum(notificationId, clientsNum);
    } catch (error) {
      console.error('[SocketIO] Update target clients error: %o', error);
    }
  });

  socket.on('ack', async (data) => {
    let { notificationId, clientsNum } = data;
    let hourToCheck = getCheckHour(false);
    try {
      await Cache.hincrby(`sentNum:${hourToCheck}`, notificationId, clientsNum);
      await Notification.updateNotificationStatus(notificationId, { status: NOTIFICATION_STATUS.COMPLETE });
    } catch (error) {
      console.error('[SocketIO] Update sent clients error: %o', error);
    }
  });
});

async function fnConsumer(msg, ack) {
  const { notificationId, channelId } = JSON.parse(msg.content);
  console.info('[SocketIO] Websocket worker receive job with id: %s', notificationId);
  socket.emit('checkRoom', { roomId: channelId, notificationId });

  try {
    // Update notification status in mysql
    const updated = await Notification.updateNotificationStatus(notificationId, { status: NOTIFICATION_STATUS.DELEVERED });
    if (!updated) {
      console.info(`[SocketIO] Notification ${notificationId} has been deleted before delevered`);
      return ack(true);
    }
    const msgContent = await Content.getContentById(notificationId);
    const payload = {
      notification_id: notificationId,
      title: msgContent.title,
      body: msgContent.body,
      icon: msgContent.icon,
      config: msgContent.config,
    };
    socket.emit('push', { roomId: channelId, payload });
    console.info('[SocketIO] Successfully send push requirment to socket server about room: %s', channelId);
    ack(true);
  } catch (error) {
    await createErrorLog(error);
    console.error('[SocketIO] Consume error \nRecord error in MongoDB: %o', error);
    ack(true);
  }
}

(async function () {
  await RabbitMQ.connect();
  await RabbitMQ.consumeQueue(WEBSOCKET_QUEUE, fnConsumer);
})();
