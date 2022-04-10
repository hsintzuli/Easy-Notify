const { pool } = require('./mysqlcon');
const moment = require('moment');

const createNotification = async (id, app_id, send_type, scheduled, scheduled_time) => {
  const notifications = {
    id: id,
    app_id: app_id,
    send_type: send_type,
    created_time: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
    scheduled: 0,
    status: 0,
  };

  if (scheduled) {
    notifications.scheduled = 1;
    notifications.scheduled_time = scheduled_time;
  }

  const [result] = await pool.query('INSERT INTO notifications SET ?', notifications);
  return result.insertId;
};

module.exports = {
  createNotification,
};
