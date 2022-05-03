require('dotenv').config();
const { pool } = require('./mysqlcon');

const createApp = async (user_id, name, description, contact_email, default_icon) => {
  const app = { user_id, name, description, contact_email, default_icon };
  const [result] = await pool.query('INSERT INTO apps SET ?', app);
  console.log(result);
  return result.insertId;
};

const getApps = async (user_id) => {
  const [results] = await pool.query(
    `SELECT apps.*, COUNT(channels.id) AS channels FROM apps 
    INNER JOIN channels ON apps.id = channels.app_id WHERE user_id = ? AND apps.archived_dt is NULL AND channels.deleted_dt is NULL GROUP BY id`,
    user_id
  );
  return results;
};

const getAppsWithArchived = async (user_id) => {
  const [results] = await pool.query('SELECT * FROM apps WHERE user_id = ?', user_id);
  return results;
};

const getAppDetail = async (app_id) => {
  const [results] = await pool.query('SELECT * FROM apps WHERE id = ?', app_id);
  return results[0];
};

const verifyAppWithUser = async (user_id, app_id) => {
  const [results] = await pool.query('SELECT * FROM apps WHERE id = ? and user_id = ?', [app_id, user_id]);
  console.log('Verify', results);
  const verified = results.length > 0;
  return verified;
};

const archiveApp = async (app_id) => {
  const [results] = await pool.query('UPDATE apps SET archived_dt = NOW() WHERE id = ?', app_id);
  const archived = results.affectedRows > 0;
  return archived;
};

module.exports = {
  createApp,
  getApps,
  getAppDetail,
  verifyAppWithUser,
  archiveApp,
  getAppsWithArchived,
};
