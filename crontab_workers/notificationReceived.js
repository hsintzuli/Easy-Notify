require('dotenv').config({ path: __dirname + '/../.env' });
const Cache = require('../utils/cache');
const { pool } = require('../server/models/mysqlcon');
const Notification = require('../server/models/notifications');
const { getCheckHour } = require('../utils/timeUtils');
const moment = require('moment');

const updateNotificationReceived = async () => {
  const now = new Date();
  const hourToCheck = getCheckHour(false);
  console.log(moment(now).format('YYYY-MM-DD HH:mm'), 'Start check receivedNumber & sentNumber in', hourToCheck);
  try {
    const receivedNum = await Cache.hgetall(`receivedNum:${hourToCheck}`);
    const sentNum = await Cache.hgetall(`sentNum:${hourToCheck}`);
    console.log(receivedNum);
    const notificationIDs = new Set([...Object.keys(receivedNum), ...Object.keys(sentNum)]);
    console.log(notificationIDs);
    const updateNotifications = [...notificationIDs].map((elemets) => {
      return { id: elemets, received_num: receivedNum[elemets] || 0, sent_num: sentNum[elemets] || 0 };
    });
    for (let notification of updateNotifications) {
      try {
        await Notification.updateNotificationNum(notification['id'], notification['sent_num'], notification['received_num']);
      } catch (error) {
        console.log(error);
        console.log(`[Error] Update notification, ID: ${notification['id']}`);
      }
    }

    await Cache.del(`receivedNum:${hourToCheck}`);
    await Cache.del(`sentNum:${hourToCheck}`);
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
