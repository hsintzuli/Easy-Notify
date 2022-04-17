const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const Cache = require('../utils/cache');
const { pool } = require('../server/models/mysqlcon');
const Notification = require('../server/models/notifications');
const moment = require('moment');

const updateNotificationReceived = async () => {
  const now = new Date();
  const hourToCheck = now.getHours() % 2 === 0 ? 'odd' : 'even';
  const key = `receivedNum:${hourToCheck}`;
  console.log(moment(now).format('YYYY-MM-DD HH:mm'), 'Start check receivedNumber in', hourToCheck);
  try {
    const receivedNum = await Cache.hgetall(key);
    const receivedArr = Object.entries(receivedNum);
    for (let received of receivedArr) {
      try {
        await Notification.updateNotificationReceived(received[0], received[1]);
      } catch (error) {
        console.log(error);
        console.log(`[Error] Update notification, ID: ${received[0]}, Received: ${received[1]}`);
      }
    }
    await Cache.del(key);
  } catch (error) {
    console.log(error);
  } finally {
    await pool.end();
    await Cache.disconnect();
    console.log('End check');
    return process.exit(0);
  }
};

updateNotificationReceived();
