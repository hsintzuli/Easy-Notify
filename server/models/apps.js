require('dotenv').config();
const { pool } = require('./mysqlcon');

const createApp = async (user_id, name, description, contact_email, default_icon) => {
  const app = { user_id, name, description, contact_email, default_icon };
  const [result] = await pool.query('INSERT INTO apps SET ?', app);
  console.log(result);
  return result.insertId;
};

const getApps = async (user_id) => {
  const [results] = await pool.query('SELECT * FROM apps WHERE user_id = ?', user_id);
  return results;
};

const getAppDetail = async (app_id) => {
  const [results] = await pool.query('SELECT * FROM apps WHERE id = ?', app_id);
  return results[0];
};

const verifyAppWithUser = async (user_id, app_id) => {
  const [results] = await pool.query('SELECT * FROM apps WHERE id = ? and user_id = ?', [app_id, user_id]);
  const verified = results.length > 0;
  return verified;
};

module.exports = {
  createApp,
  getApps,
  getAppDetail,
  verifyAppWithUser,
};
