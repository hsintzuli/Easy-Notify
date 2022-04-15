const amqp = require('amqplib');
const { RABBIT_USER, RABBIT_PW, RABBIT_HOST, RABBIT_PORT } = process.env;
const AMQP_URL = `amqp://${RABBIT_USER}:${RABBIT_PW}@${RABBIT_HOST}:${RABBIT_PORT}`;
let amqpConn = null;
let pubChannel = null;

const initConnection = async (fnToExecute) => {
  try {
    const conn = await amqp.connect(AMQP_URL);
    conn.on('error', (err) => {
      console.log('ERROR', err);
      if (err.message !== 'Connection closing') {
        console.error('[AMQP] conn error', err.message);
      }
    });

    conn.on('close', () => {
      // Reconnect when connection was closed
      console.error('[AMQP] reconnecting');
      return setTimeout(() => {
        module.exports.initConnection(fnToExecute);
      }, 10000);
    });

    // Connection OK
    console.log('[AMQP] connected');
    amqpConn = conn;
    startPublish();

    // Execute function
    await fnToExecute();
  } catch (err) {
    return closeOnErr(err);
  }
};

const consumeQueue = async (queue, fnConsumer) => {
  // Create a channel for queue
  try {
    const ch = await amqpConn.createChannel();
    console.log('[AMQP] Worker is started');

    ch.on('error', function (err) {
      console.error('[AMQP] channel error', err.message);
    });

    ch.on('close', function () {
      console.log('[AMQP] channel closed');
    });

    // Connect to queue
    await ch.assertQueue(queue, { durable: true });
    await ch.consume(queue, processMsg, { noAck: false });

    function processMsg(msg) {
      // Process incoming messages and send them to fnConsumer
      // Send a callback(true) for acknowledge the message or callback(false) for reject them
      fnConsumer(msg, (ok) => {
        try {
          ok ? ch.ack(msg) : ch.reject(msg, true);
        } catch (e) {
          closeOnErr(e);
        }
      });
    }
  } catch (err) {
    return closeOnErr(err);
  }
};

const startPublish = async () => {
  try {
    const ch = await amqpConn.createConfirmChannel();
    pubChannel = ch;
    console.log('[AMQP] Publisher started');
    ch.on('error', function (err) {
      console.error('[AMQP] channel error', err.message);
    });
    ch.on('close', function () {
      console.log('[AMQP] channel closed');
    });
  } catch (err) {
    return closeOnErr(err);
  }
};

const publishMessage = async (exchange, routingKey, content, options) => {
  // Verify if pubchannel is started
  if (!pubChannel) {
    console.error("[AMQP] Can't publish message. Publisher is not initialized.");
    return;
  }
  // convert string message in buffer
  const message = Buffer.from(content, 'utf-8');
  try {
    // Publish message to exchange
    await pubChannel.publish(exchange, routingKey, message, options);
    console.log('[AMQP] success publish');
  } catch (e) {
    console.error('[AMQP] publish', err);
    await pubChannel.connection.close();
    return;
  }
};

async function closeOnErr(err) {
  if (!err) return false;
  console.error('[AMQP] error', err);
  await amqpConn.close();
  return true;
}

module.exports = {
  initConnection,
  consumeQueue,
  publishMessage,
  closeOnErr,
};
