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
  const [result] = await pool.query('INSERT INTO subscriptions SET ? ON DUPLICATE KEY UPDATE id = ?, updated_dt = NOW(), status = 0', [client, id]);
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
  if (client_tag && client_tag.length > 0) {
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

const getClientCountByUser = async (user_id) => {
  const [results] = await pool.query(
    `SELECT COUNT(s.id) AS total_client FROM users AS u INNER Join apps AS a
    ON a.user_id = u.id  INNER Join channels AS c ON a.id=c.app_id INNER Join subscriptions AS s ON s.channel_id = c.id
    WHERE u.id = ?;`,
    user_id
  );
  return results[0];
};

const getLastlyClientByUser = async (user_id) => {
  const [results] = await pool.query(
    `SELECT COUNT(s.id) AS activated_user, SUM(if(s.created_dt >= DATE(NOW() - INTERVAL 7 DAY), 1, 0)) AS new_clients FROM users AS u INNER Join apps AS a
    ON a.user_id = u.id  INNER Join channels AS c ON a.id=c.app_id INNER Join subscriptions AS s ON s.channel_id = c.id
    WHERE u.id = ? AND s.updated_dt >= DATE(NOW() - INTERVAL 7 DAY);`,
    user_id
  );
  return results[0];
};

const getClientGroupByDate = async (user_id, start_date, end_date, interval) => {
  const [results] = await pool.query(
    `SELECT DATE_FORMAT(s.created_dt, ?) AS dates, COUNT(s.id) AS subscription FROM subscriptions AS s
    INNER JOIN channels AS c ON s.channel_id = c.id INNER JOIN apps AS a ON c.app_id = a.id INNER JOIN users AS u ON a.user_id = u.id
    WHERE s.created_dt > ? AND s.created_dt < ? AND u.id = ? GROUP BY dates ORDER BY dates;`,
    [interval, start_date, end_date, user_id]
  );
  return results;
};

module.exports = {
  createClient,
  updateClient,
  removeClient,
  getClientIds,
  getClientDetailByIds,
  updateClientTag,
  getClientCountByUser,
  getClientGroupByDate,
  getLastlyClientByUser,
};
