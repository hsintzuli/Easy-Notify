require('dotenv').config();
const { pool } = require('./mysqlcon');

const createApp = async (user_id, name, description, contact_email, default_icon) => {
  const app = { user_id, name, description, contact_email, default_icon };
  try {
    const [result] = await pool.query('INSERT INTO apps SET ?', app);
    return { app_id: result.insertId };
  } catch (error) {
    return { error };
  }
};

const getApps = async (user_id) => {
  const [results] = await pool.query(
    `SELECT apps.*, COUNT(channels.id) AS channels FROM apps 
    LEFT JOIN channels ON apps.id = channels.app_id And channels.deleted_dt is NULL WHERE user_id = ? AND apps.archived_dt is NULL GROUP BY apps.id`,
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
  return results.length > 0;
};

const archiveApp = async (app_id) => {
  const [results] = await pool.query('UPDATE apps SET archived_dt = NOW() WHERE id = ?', app_id);
  return results.affectedRows > 0;
};

module.exports = {
  createApp,
  getApps,
  getAppDetail,
  verifyAppWithUser,
  archiveApp,
  getAppsWithArchived,
};
