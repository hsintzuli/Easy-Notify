require('dotenv').config();
const { getTotalSubscriptions } = require('./fake_data');
const totalSubscriptions = getTotalSubscriptions();
const { pool } = require('../server/models/mysqlcon');

async function createFakeSubscribers(subscriptions) {
  return await pool.query('INSERT INTO subscriptions (id, channel_id, endpoint, `keys`, client_tag, status, created_dt, updated_dt) VALUES ?', [subscriptions]);
}

async function closeConnection() {
  return await pool.end();
}

async function main() {
  console.log(totalSubscriptions);
  await createFakeSubscribers(totalSubscriptions);
  await closeConnection();
}

// execute when called directly.
if (require.main === module) {
  main();
}
