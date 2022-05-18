require('dotenv').config({ path: __dirname + '/.env' });
const httpServer = require('http').createServer();
const { Server } = require('socket.io');
const redis = require('socket.io-redis');
const { SOCKET_TOKEN, SOCKETIO_PORT, CACHE_HOST, CACHE_PORT, CACHE_USER, CACHE_PASSWORD } = process.env;
let serverId;

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

// get the numbers of clients in channel
const getRoomByChannel = (channelId) => {
  const room = io.sockets.adapter.rooms.get(channelId) || new Set();
  return room;
};

serverId = io.engine.generateId();
console.log('Socket Server Initialize!, ID:', serverId);
io.adapter(redis({ host: CACHE_HOST, port: CACHE_PORT, user: CACHE_USER, password: CACHE_PASSWORD }));

// Authentication middleware for admin client (socketIO worker)
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
  if (socket.role === 1) {
    adminSocketOperation(socket);
  } else {
    clientSocketOperation(socket);
  }
});

// Communication with socketIO worker. Handle checkRoom clients & push notification request.
const adminSocketOperation = (socket) => {
  console.log('Connect with websocket worker!!!!! \n');
  socket.emit('connection', 'Hello worker, ' + socket.id);
  socket.on('checkRoom', (data) => {
    let { roomId, notificationId } = data;
    const room = getRoomByChannel(roomId);
    socket.emit('roomNums', { roomId, notificationId, clientsNum: room.size });
  });

  socket.on('push', (data) => {
    console.log('Receive push event from websocket worker', data);
    let { roomId, payload } = data;
    io.in(roomId).emit('push', payload);

    const room = getRoomByChannel(roomId);
    socket.emit('ack', { notificationId: payload.notification_id, clientsNum: room.size });
  });
};

// Communication with all socketIO clients. Handle clients' subscriptions & connections.
const clientSocketOperation = (socket) => {
  socket.emit('connection', 'Hello client, ' + socket.id);
  socket.on('subscribe', async (data) => {
    try {
      const { channel_id } = data;
      console.log('Socket client subscribe room:', channel_id);
      socket.join(channel_id);
    } catch (error) {
      console.log('[error]', 'join room :', error);
      socket.emit('error', 'couldnt perform requested action');
    }
  });

  socket.on('unsubscribe', (data) => {
    const { channel_id } = data;
    console.log('Socket client unsubscribe room', channel_id);
    socket.leave(channel_id);
  });

  socket.on('disconnect', async (reason) => {
    let total = io.engine.clientsCount;
    console.log('Socket disconnect! 現在連線人數:', total);
  });
};

httpServer.listen(SOCKETIO_PORT);
