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
      console.log('subscribe room:', res.channel_id);
      socket.join(res.channel_id);
    });
    socket.on('unsubscribe', async (res) => {
      console.log('unsubscribe room', res);
      socket.leaveAll();
    });
  });
}

const sendMsg = (room, message) => {
  console.log('Send Message to Room:', room);
  io.in(room).emit('push', message);
};

module.exports = {
  config,
  sendMsg,
};
