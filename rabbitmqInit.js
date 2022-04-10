require('dotenv').config({ path: __dirname + '/.env' });
const amqp = require('amqplib');
const { RABBIT_USER, RABBIT_PW, RABBIT_HOST, RABBIT_PORT, DELAY_EXCHANGE, DELAY_QUEUE } = process.env;
const AMQP_URL = `amqp://${RABBIT_USER}:${RABBIT_PW}@${RABBIT_HOST}:${RABBIT_PORT}`;

const setMessageQueue = async () => {
  let conn;
  try {
    conn = await amqp.connect(AMQP_URL);
    const ch = await conn.createChannel();

    // Connection OK
    console.log('[AMQP] connected');

    conn.on('error', (err) => {
      console.log('ERROR', err);
      if (err.message !== 'Connection closing') {
        console.error('[AMQP] conn error', err.message);
      }
    });
    await ch.assertExchange(DELAY_EXCHANGE, 'x-delayed-message', { autoDelete: false, durable: true, arguments: { 'x-delayed-type': 'direct' } });
    console.log('Assert Exchange!', DELAY_EXCHANGE);
    await ch.assertQueue(DELAY_QUEUE, { durable: true });
    await ch.bindQueue(DELAY_QUEUE, DELAY_EXCHANGE);
    console.log('Assert Queue and complete bind!', DELAY_QUEUE);
  } catch (err) {
    console.error('[AMQP]', err.message);
  } finally {
    await conn.close();
  }
};

setMessageQueue();
