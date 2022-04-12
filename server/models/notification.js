const { pool } = require('./mysqlcon');
const moment = require('moment');

const createNotification = async (id, channel_id, send_type, scheduled_time) => {
  const notification = {
    id: id,
    channel_id: channel_id,
    type: send_type,
    created_dt: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
    scheduled_dt: scheduled_time,
    status: 0,
  };

  if (scheduled) {
    notification.scheduled_dt = scheduled_time;
  }

  const [result] = await pool.query('INSERT INTO notification SET ?', notification);
  return result.insertId;
};

module.exports = {
  createNotification,
};
