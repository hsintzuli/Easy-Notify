const { pool } = require('./mysqlcon');

const createClient = async (app_id, endpoint, expirationTime, keys, user_id = null) => {
  const user = {
    app_id: app_id,
    endpoint: endpoint,
    expiration_time: expirationTime,
    keys: keys,
    user_id: user_id,
  };
  const [result] = await pool.query('INSERT INTO client SET ?', user);
  return result.insertId;
};

const getClients = async (app_id, users) => {
  const [results] = await pool.query('SELECT id, endpoint, `keys` FROM client WHERE app_id = ? ORDER BY id', app_id);
  return results;
};

module.exports = {
  createClient,
  getClients,
};
