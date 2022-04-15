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
  const [result] = await pool.query('INSERT INTO subscription SET ?', client);
  console.log('Create Client:', result);
  return id;
};

const getClients = async (channel_id, users) => {
  if (users) {
    const [results] = await pool.query('SELECT id, endpoint, `keys` FROM subscription WHERE id in (?) AND　channel_id = ? AND ORDER BY id', [
      users,
      channel_id,
    ]);
    return results;
  }
  const [results] = await pool.query('SELECT id, endpoint, `keys` FROM subscription WHERE channel_id = ?', channel_id);
  return results;
};

const updateClient = async (condition, client_id) => {
  const [results] = await pool.query('UPDATE subscription SET ? WHERE id = ?', [condition, client_id]);
  return results;
};

const removeClient = async (endpoint) => {
  const [results] = await pool.query('DELETE FROM subscription WHERE endpoint = ?', endpoint);
  const deleted = results.affectedRows > 0;
  return deleted;
};

const getClientIds = async (channel_id, users) => {
  if (users) {
    const [results] = await pool.query('SELECT id FROM subscription WHERE id in (?) AND　channel_id = ? AND ORDER BY id', [users, channel_id]);
    return results;
  }
  const [results] = await pool.query('SELECT id FROM subscription WHERE channel_id = ?', channel_id);
  return results;
};

const getClientByIds = async (users) => {
  const [results] = await pool.query('SELECT id, endpoint, `keys` FROM subscription WHERE id in (?) ORDER BY id', users);
  return results;
};

module.exports = {
  createClient,
  updateClient,
  getClients,
  removeClient,
  getClientIds,
  getClientByIds,
};
