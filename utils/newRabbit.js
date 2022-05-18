const amqp = require('amqplib');
const { RABBIT_USER, RABBIT_PW, RABBIT_HOST, RABBIT_PORT } = process.env;
const AMQP_URL = `amqp://${RABBIT_USER}:${RABBIT_PW}@${RABBIT_HOST}:${RABBIT_PORT}`;

let amqpConn = null;
let pubChannel = null;
let tryReconnect = true;

const connect = async () => {
  try {
    amqpConn = await amqp.connect(AMQP_URL);
    amqpConn.on('error', (error) => {
      if (error.message !== 'Connection closing') {
        console.error('[AMQP] connect error', error.message);
      }
    });

    amqpConn.on('close', () => {
      // Reconnect when connection was closed
      if (tryReconnect) {
        console.log('[AMQP] reconnecting');
        return setTimeout(() => {
          connect();
        }, 10000);
      }
    });

    console.log('[AMQP] successfully connected');
  } catch (error) {
    console.error('[AMQP] Connect error', error);
    return setTimeout(() => {
      connect();
    }, 10000);
  }
};

// Create channel for publishing
const startPublish = async () => {
  try {
    if (!amqpConn) {
      throw new Error('[AMQP] Publish Error');
    }
    pubChannel = await amqpConn.createConfirmChannel();
    console.log('[AMQP] Publisher started');
    pubChannel.on('error', function (err) {
      console.error('[AMQP] publish channel error', err.message);
    });
    pubChannel.on('close', function () {
      console.log('[AMQP] publish channel closed');
    });

    return publishMessage;
  } catch (error) {
    return closeOnErr(error);
  }
};

const publishMessage = async (exchange, routingKey, content, options) => {
  // Verify if pubchannel is started
  if (!pubChannel) {
    await startPublish();
  }

  // convert string message in buffer
  const message = Buffer.from(content, 'utf-8');
  try {
    // Publish message to exchange
    await pubChannel.publish(exchange, routingKey, message, options);
    console.log('[AMQP] successfully publish');
  } catch (error) {
    console.error('[AMQP] publish error', error);
    await pubChannel.connection.close();
    return;
  }
};

const consumeQueue = async (queue, fnConsumer) => {
  // Create a channel for queue
  try {
    const consumerChannel = await amqpConn.createChannel();
    console.log('[AMQP] Consumer is started');

    consumerChannel.on('error', function (error) {
      console.error('[AMQP] consumer channel error', error.message);
    });

    consumerChannel.on('close', function () {
      console.log('[AMQP] consumer channel closed');
    });

    // Connect to queue
    await consumerChannel.assertQueue(queue, { durable: true });
    await consumerChannel.consume(queue, processMsg, { noAck: false });

    function processMsg(msg) {
      // Process incoming messages and send them to fnConsumer
      // Send a callback(true) for acknowledge the message or callback(false) for reject them
      fnConsumer(msg, (ok) => {
        try {
          ok ? consumerChannel.ack(msg) : consumerChannel.reject(msg, true);
        } catch (error) {
          closeOnErr(error);
        }
      });
    }
  } catch (err) {
    return closeOnErr(err);
  }
};

const connectToPublish = async () => {
  try {
    await connect();
    await startPublish();
  } catch (error) {
    console.error(error);
    closeOnErr();
  }
};

const closeConnection = async () => {
  tryReconnect = false;
  await amqpConn.close();
};

const closeOnErr = async (error) => {
  if (!error) return false;
  console.error('[AMQP] Close connection because', error);

  if (!amqpConn) {
    return console.error('[AMQP] No connection to close');
  }

  try {
    await amqpConn.close();
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

module.exports = {
  connect,
  startPublish,
  publishMessage,
  consumeQueue,
  connectToPublish,
  closeConnection,
};
