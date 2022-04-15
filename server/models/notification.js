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

const updateNotificationStatus = async (notification_id, status) => {
  const [results] = await pool.query('UPDATE notification SET ? WHERE id = ?', [status, notification_id]);
  const updated = results.affectedRows > 0;
  return updated;
};

const updateNotificationReceived = async (notification_id, receive_num) => {
  const [results] = await pool.query('UPDATE notification SET receive_num = receive_num + ? WHERE id = ?', [receive_num, notification_id]);
  const updated = results.affectedRows > 0;
  return updated;
};

module.exports = {
  createNotification,
  getNotifications,
  getNotificationBYId,
  deleteNotification,
  updateNotificationStatus,
  updateNotificationReceived,
};
