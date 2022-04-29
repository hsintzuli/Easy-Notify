require('dotenv').config({ path: __dirname + '/.env' });
const httpServer = require('http').createServer();
const { Server } = require('socket.io');
const Cache = require('./utils/cache');
const redis = require('socket.io-redis');
const { SOCKET_TOKEN, SOCKETIO_PORT, CACHE_HOST, CACHE_PORT, CACHE_USER, CACHE_PASSWORD } = process.env;
let serverId;

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});
io.adapter(redis({ host: CACHE_HOST, port: CACHE_PORT, user: CACHE_USER, password: CACHE_PASSWORD }));
serverId = io.engine.generateId();
console.log('Socket Server Initialize!, ID:', serverId);

// Authentication middleware for admin client - express server
io.use((socket, next) => {
  let total = io.engine.clientsCount;
  console.log('New connect! 現在連線人數:', total);
  if (socket.handshake.auth && socket.handshake.auth.token && socket.handshake.auth.token === SOCKET_TOKEN) {
    socket.role = 1;
    return next();
  } else {
    socket.role = 0;
    return next();
  }
});

io.on('connection', async (socket) => {
  if (socket.role) {
    console.log('Connect with websocket worker!!!!! \n');
    socket.emit('connection', 'Hello worker, ' + socket.id);
    socket.on('push', (data) => {
      console.log('Receive push', data);
      let { roomId, payload } = data;
      io.in(roomId).emit('push', payload);

      const room = io.sockets.adapter.rooms.get(roomId) || new Set();
      socket.emit('ack', { notificationId: payload.notification_id, clientsNum: room.size });
    });
  } else {
    socket.emit('connection', 'Hello client, ' + socket.id);
    socket.on('subscribe', async (data) => {
      const { channel_id } = data;
      console.log('subscribe room:', channel_id);
      socket.join(channel_id);
      const room = io.sockets.adapter.rooms.get(channel_id) || new Set();
      await Cache.hset(`clientNums{${channel_id}}`, serverId, room.size);
    });
    socket.on('unsubscribe', async (res) => {
      console.log('unsubscribe room', res);
      socket.leaveAll();
    });
  }
});

httpServer.listen(SOCKETIO_PORT);
