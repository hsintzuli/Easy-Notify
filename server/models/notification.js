const { pool } = require('./mysqlcon');
const moment = require('moment');

const createNotification = async (id, channel_id, send_type, scheduled_time) => {
  const notification = {
    id: id,
    channel_id: channel_id,
    type: send_type,
    create_dt: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
    status: 0,
    receive_num: 0,
  };

  if (scheduled_time) {
    notification.scheduled_dt = scheduled_time;
  }

  const [result] = await pool.query('INSERT INTO notification SET ?', notification);
  return result.insertId;
};

const getNotifications = async (channel_id) => {
  const [results] = await pool.query('SELECT * FROM notification WHERE channel_id = ? ORDER BY create_dt DESC', channel_id);
  return results;
};

const getNotificationBYId = async (notification_id) => {
  const [results] = await pool.query('SELECT * FROM notification WHERE id = ?', notification_id);
  return results[0];
};

const deleteNotification = async (notification_id) => {
  const [results] = await pool.query('DELETE FROM notification WHERE id = ? AND status = 0', notification_id);
  const deleted = results.affectedRows > 0;
  return deleted;
};

module.exports = {
  createNotification,
  getNotifications,
  getNotificationBYId,
  deleteNotification,
};
