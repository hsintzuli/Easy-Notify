require('dotenv').config();
const { Server } = require('socket.io');
let io;

function config(server) {
  // Socket.io Initialization
  console.log('Initialize socket');
  io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', async (socket) => {
    console.log('Socket connect!');
    socket.emit('connection', 'Hello! ' + socket.id);
    socket.on('subscribe', async (res) => {
      console.log('subscribe room', res.app_id);
      socket.join(res.app_id);
    });
  });
}

const sendMsg = (room, message) => {
  console.log('Rooms', room);
  io.in(room).emit('push', message);
};

module.exports = {
  config,
  sendMsg,
};
