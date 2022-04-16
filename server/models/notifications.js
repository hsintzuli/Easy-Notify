const { pool } = require('./mysqlcon');

const createNotification = async (id, channel_id, send_type, scheduled_time) => {
  const notification = {
    id: id,
    channel_id: channel_id,
    type: send_type,
    status: 0,
    received_num: 0,
  };

  if (scheduled_time) {
    notification.scheduled_dt = scheduled_time;
  }

  const [result] = await pool.query('INSERT INTO notifications SET ?', notification);
  return result.insertId;
};

const getNotifications = async (channel_id) => {
  const [results] = await pool.query('SELECT * FROM notifications WHERE channel_id = ? ORDER BY created_dt DESC', channel_id);
  return results;
};

const getNotificationById = async (notification_id) => {
  const [results] = await pool.query('SELECT * FROM notifications WHERE id = ?', notification_id);
  return results[0];
};

const deleteNotification = async (notification_id) => {
  const [results] = await pool.query('DELETE FROM notifications WHERE id = ? AND status = 0', notification_id);
  const deleted = results.affectedRows > 0;
  return deleted;
};

const updateNotificationStatus = async (notification_id, status) => {
  const [results] = await pool.query('UPDATE notifications SET ? WHERE id = ?', [status, notification_id]);
  const updated = results.affectedRows > 0;
  return updated;
};

const updateNotificationReceived = async (notification_id, receive_num) => {
  const [results] = await pool.query('UPDATE notifications SET received_num = received_num + ? WHERE id = ?', [receive_num, notification_id]);
  const updated = results.affectedRows > 0;
  return updated;
};

module.exports = {
  createNotification,
  getNotifications,
  getNotificationById,
  deleteNotification,
  updateNotificationStatus,
  updateNotificationReceived,
};
