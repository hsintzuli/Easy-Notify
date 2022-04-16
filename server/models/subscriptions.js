const { pool } = require('./mysqlcon');
const { nanoid } = require('nanoid');

const createClient = async (channel_id, endpoint, expirationTime, keys, client_tag = null) => {
  const id = nanoid();
  const client = {
    id: id,
    channel_id: channel_id,
    endpoint: endpoint,
    expire_dt: expirationTime,
    keys: keys,
    client_tag: client_tag,
  };
  const [result] = await pool.query('INSERT INTO subscriptions SET ?', client);
  console.log('Create Client:', result);
  return id;
};

const updateClient = async (client_id, condition) => {
  const [results] = await pool.query('UPDATE subscriptions SET ? WHERE id = ?', [condition, client_id]);
  return results;
};

const updateClientTag = async (channel_id, endpoint, tag) => {
  const [results] = await pool.query('UPDATE subscriptions SET client_tag = ? WHERE channel_id = ? AND endpoint = ?', [tag, channel_id, endpoint]);
  return results;
};

const removeClient = async (endpoint) => {
  const [results] = await pool.query('DELETE FROM subscriptions WHERE endpoint = ?', endpoint);
  const deleted = results.affectedRows > 0;
  return deleted;
};

const getClientIds = async (channel_id, client_tag) => {
  if (client_tag) {
    const [results] = await pool.query('SELECT id FROM subscriptions WHERE channel_id = ? AND client_tag in (?) ORDER BY id', [channel_id, client_tag]);
    return results;
  }
  const [results] = await pool.query('SELECT id FROM subscriptions WHERE channel_id = ?', channel_id);
  return results;
};

const getClientDetailByIds = async (subscription_ids) => {
  const [results] = await pool.query('SELECT id, endpoint, `keys` FROM subscriptions WHERE id in (?) ORDER BY id', [subscription_ids]);
  console.log(results);
  return results;
};

module.exports = {
  createClient,
  updateClient,
  removeClient,
  getClientIds,
  getClientDetailByIds,
  updateClientTag,
};
