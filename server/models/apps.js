require('dotenv').config();
const { pool } = require('./mysqlcon');

const createApp = async (user_id, name) => {
  const app = { user_id, name };
  const [result] = await pool.query('INSERT INTO app SET ?', app);
  console.log(result);
  return result.insertId;
};

const getApps = async (user_id) => {
  const [results] = await pool.query('SELECT * FROM app WHERE user_id = ?', user_id);
  return results;
};

const getAppDetail = async (app_id) => {
  const [results] = await pool.query('SELECT * FROM app WHERE id = ?', app_id);
  return results[0];
};

const verifyAppWithUser = async (user_id, app_id) => {
  const [results] = await pool.query('SELECT * FROM app WHERE id = ? and user_id = ?', [app_id, user_id]);
  const verified = results.length > 0;
  return verified;
};

module.exports = {
  createApp,
  getApps,
  getAppDetail,
  verifyAppWithUser,
};
