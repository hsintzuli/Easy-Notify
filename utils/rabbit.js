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
    console.log('[AMQP] successfully connected');
    return amqpConn;
  } catch (error) {
    console.error('[AMQP] error on rabbitmq first connection', error);
    reconnect();
  }
};

// Create channel for publishing
const startPublish = async () => {
  if (!amqpConn) {
    throw new Error('[AMQP] Publish Error');
  }

  try {
    pubChannel = await amqpConn.createConfirmChannel();
    console.log('[AMQP] Publisher started');
    pubChannel.on('error', async function (err) {
      console.error('[AMQP] publish channel error', err.message);
      await pubChannel.connection.close();
    });
    pubChannel.on('close', function () {
      pubChannel = null;
      console.log('[AMQP] publish channel closed');
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
    console.log('[AMQP] successfully publish');
  } catch (error) {
    await pubChannel.connection.close();
    throw new Error('[AMQP] publish error', error);
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
          closeOnChannelError(error);
        }
      });
    }
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
  console.log('[AMQP] connection closed');
};

const reconnect = () => {
  console.log('[AMQP] reconnectting');
  setTimeout(() => connect(), 10000);
};

const onClose = () => {
  console.log('[AMQP] connection closing');
  amqpConn = null;
  if (tryReconnect) {
    reconnect();
  }
};

const onError = (error) => {
  amqpConn = null;
  console.error('[AMQP] connect error', error.message);
  if (error.message !== 'Connection closing') {
    reconnect();
  }
};

const closeOnChannelError = async (error) => {
  if (!error) return false;
  console.error('[AMQP] Close connection because', error);

  try {
    await amqpConn.close();
    return true;
  } catch (error) {
    console.error(error);
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
