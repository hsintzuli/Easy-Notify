const amqp = require('amqplib');
const { RABBIT_USER, RABBIT_PW, RABBIT_HOST, RABBIT_PORT } = process.env;
const AMQP_URL = `amqp://${RABBIT_USER}:${RABBIT_PW}@${RABBIT_HOST}:${RABBIT_PORT}`;

let amqpConn = null;
let pubChannel = null;
let tryReconnect = true;

const connect = async () => {
  try {
    amqpConn = await amqp.connect(AMQP_URL);
    amqpConn.on('error', onError);
    amqpConn.on('close', onClose);
    console.info('[Rabbit] successfully connected');
    return amqpConn;
  } catch (error) {
    onError(error);
  }
};

// Create channel for publishing
const startPublish = async () => {
  if (!amqpConn) {
    throw new Error('[Rabbit] Publish error because no existing connection');
  }

  try {
    pubChannel = await amqpConn.createConfirmChannel();
    console.info('[Rabbit] Publisher started');
    pubChannel.on('error', async function (err) {
      console.error('[Rabbit] publish channel error: %o', err.message);
      await pubChannel.connection.close();
    });
    pubChannel.on('close', function () {
      pubChannel = null;
      console.warn('[Rabbit] publish channel closed');
    });

    return true;
  } catch (error) {
    return onError(error);
  }
};

const publishMessage = async (exchange, routingKey, content, options) => {
  // Verify if pubchannel is started
  if (!pubChannel) {
    await startPublish();
  }

  try {
    // convert string message in buffer
    const message = Buffer.from(content, 'utf-8');

    // Publish message to exchange
    await pubChannel.publish(exchange, routingKey, message, options);
    console.info('[Rabbit] successfully publish message: %o', message);
  } catch (error) {
    console.error('[Rabbit] publish message error: %o', error);
    throw new Error('[Rabbit] publish error');
  }
};

const consumeQueue = async (queue, fnConsumer) => {
  // Create a channel for queue
  try {
    const consumerChannel = await amqpConn.createChannel();
    console.info('[Rabbit] Consumer is started');

    consumerChannel.on('error', function (error) {
      console.error('[Rabbit] consumer channel error: %o', error);
    });

    consumerChannel.on('close', function () {
      console.warn('[Rabbit] consumer channel closed');
    });

    // Connect to queue
    await consumerChannel.assertQueue(queue, { durable: true });

    const processMsg = (msg) => {
      // Process incoming messages and send them to fnConsumer
      // Send a callback(true) for acknowledge the message or callback(false) for reject them
      fnConsumer(msg, (ok) => {
        try {
          ok ? consumerChannel.ack(msg) : consumerChannel.reject(msg, true);
        } catch (error) {
          closeOnChannelError(error);
        }
      });
    };

    await consumerChannel.consume(queue, processMsg, { noAck: false });
  } catch (error) {
    return closeOnChannelError(error);
  }
};

const closeConnection = async () => {
  if (!amqpConn) {
    return Promise.resolve();
  }

  tryReconnect = false;
  await amqpConn.close();
  amqpConn = null;
  console.info('[Rabbit] Manually close connection');
};

const reconnect = () => {
  console.warn('[Rabbit] reconnectting');
  setTimeout(() => connect(), 10000);
};

const onClose = () => {
  console.warn('[Rabbit] connection closing');
  amqpConn = null;
  if (tryReconnect) {
    reconnect();
  }
};

const onError = (error) => {
  amqpConn = null;
  console.error('[Rabbit] connect error: %o', error);
  if (error.message !== 'Connection closing') {
    reconnect();
  }
};

const closeOnChannelError = async (error) => {
  if (!error) return false;
  console.error('[Rabbit] Close connection because: %o', error);

  try {
    await amqpConn.close();
    return true;
  } catch (error) {
    console.error('[Rabbit] close connection error: %o', error);
    return false;
  } finally {
    amqpConn = null;
  }
};

module.exports = {
  connect,
  startPublish,
  publishMessage,
  consumeQueue,
  closeConnection,
};
