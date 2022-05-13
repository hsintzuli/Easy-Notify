const { pool } = require('./mysqlcon');
const NOTIFICATION_STATUS = {
  RECEIVED: 0,
  ONQUEUE: 1,
  DELEVERED: 2,
  COMPLETE: 3,
};

const createNotification = async (id, channel_id, name, send_type, scheduled_time, notPublishToQueue) => {
  const notification = {
    id: id,
    channel_id: channel_id,
    name: name,
    type: send_type,
    status: NOTIFICATION_STATUS.RECEIVED,
    received_num: 0,
  };

  if (scheduled_time) {
    notification.scheduled_dt = scheduled_time;
  }
  if (!notPublishToQueue) {
    notification.status = NOTIFICATION_STATUS.ONQUEUE;
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
  const [results] = await pool.query('DELETE FROM notifications WHERE id = ?', [notification_id]);
  const deleted = results.affectedRows > 0;
  return deleted;
};

const updateNotificationStatus = async (notification_id, status) => {
  console.log(status);
  const [results] = await pool.query('UPDATE notifications SET ? WHERE id = ?', [status, notification_id]);
  const updated = results.affectedRows > 0;
  return updated;
};

const updateNotificationNum = async (notification_id, sent_num, receive_num) => {
  const [results] = await pool.query('UPDATE notifications SET sent_num = sent_num + ?, received_num = received_num + ? WHERE id = ?', [
    sent_num,
    receive_num,
    notification_id,
  ]);
  const updated = results.affectedRows > 0;
  return updated;
};

const updateNotificationTargetsNum = async (notification_id, targets_num) => {
  const [results] = await pool.query('UPDATE notifications SET targets_num = targets_num + ? WHERE id = ?', [targets_num, notification_id]);
  const updated = results.affectedRows > 0;
  return updated;
};

const getMaxOnlineClient = async (user_id) => {
  const [results] = await pool.query(
    `SELECT MAX(n.targets_num) AS max_online_clients FROM users AS u INNER Join apps AS a ON  a.user_id = u.id  
    INNER Join channels AS c ON a.id = c.app_id INNER Join notifications AS n ON n.channel_id = c.id  AND n.type = 'websocket'
  WHERE u.id = ?;`,
    user_id
  );
  return results[0];
};

const getNotificationSent = async (user_id) => {
  const [results] = await pool.query(
    `SELECT SUM(n.targets_num) AS notification_sent, AVG(n.sent_num / n.targets_num) AS delivered_rate, COUNT(DISTINCT a.id) AS apps FROM users AS u INNER Join apps AS a
    ON a.user_id = u.id  INNER Join channels AS c ON a.id=c.app_id INNER Join notifications AS n ON n.channel_id = c.id
    WHERE u.id = ?;`,
    user_id
  );
  return results[0];
};

const getNotificationByApp = async (app_id, start_dt, end_dt) => {
  const [results] = await pool.query(
    `SELECT n.id, c.name AS channel, n.name AS name, n.status, n.scheduled_dt, n.type, n.created_dt FROM notifications AS n INNER JOIN channels AS c 
  ON n.channel_id = c.id WHERE c.app_id = ? AND n.created_dt > ? AND n.created_dt < ? 
  ORDER BY n.created_dt DESC`,
    [app_id, start_dt, end_dt]
  );
  return results;
};

module.exports = {
  NOTIFICATION_STATUS,
  createNotification,
  getNotifications,
  getNotificationById,
  deleteNotification,
  updateNotificationStatus,
  updateNotificationTargetsNum,
  updateNotificationNum,
  getMaxOnlineClient,
  getNotificationSent,
  getNotificationByApp,
};
