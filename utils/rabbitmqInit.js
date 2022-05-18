require('dotenv').config({ path: __dirname + '/.env' });
const RabbitMQ = require('./rabbit');
const { DELAY_EXCHANGE, REALTIME_EXCHANGE, WEBSOCKET_QUEUE, WEBPUSH_QUEUE, DELAY_QUEUE } = process.env;
const setExchangeAndQueue = async (amqpConn) => {
  try {
    const ch = await amqpConn.createChannel();

    await ch.assertExchange(DELAY_EXCHANGE, 'x-delayed-message', { autoDelete: false, durable: true, arguments: { 'x-delayed-type': 'fanout' } });
    await ch.assertQueue(DELAY_QUEUE, { durable: true });
    await ch.bindQueue(DELAY_QUEUE, DELAY_EXCHANGE);
    await ch.assertExchange(REALTIME_EXCHANGE, 'direct', { autoDelete: false, durable: true });
    await ch.assertQueue(WEBSOCKET_QUEUE, { durable: true });
    await ch.bindQueue(WEBSOCKET_QUEUE, REALTIME_EXCHANGE, 'websocket');
    await ch.assertQueue(WEBPUSH_QUEUE, { durable: true });
    await ch.bindQueue(WEBPUSH_QUEUE, REALTIME_EXCHANGE, 'webpush');
    console.log('[AMQP] Assert Queue and complete bind!');
  } catch (err) {
    console.error('[AMQP]', err.message);
  }
};

(async function () {
  const connection = await RabbitMQ.connect();
  await setExchangeAndQueue(connection);
  await RabbitMQ.closeConnection();
})();
