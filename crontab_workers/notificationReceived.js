require('dotenv').config({ path: __dirname + '/../.env' });
const { WORKERS_ERROR_FILE_PATH } = process.env;
const logger = require('../logger/index').setLogger(WORKERS_ERROR_FILE_PATH);
const Cache = require('../utils/cache');
const { pool } = require('../server/models/mysqlcon');
const Notification = require('../server/models/notifications');
const { getCheckHour } = require('../utils/timeUtils');

const updateNotificationReceived = async () => {
  const now = new Date();
  const hourToCheck = getCheckHour(false);
  console.info('[updateNotificationReceived] Start check receivedNumber & sentNumber in', hourToCheck);
  try {
    const receivedNum = await Cache.hgetall(`receivedNum:${hourToCheck}`);
    const sentNum = await Cache.hgetall(`sentNum:${hourToCheck}`);
    console.debug('[updateNotificationReceived] record receivedNum: %o', receivedNum);
    const notificationIDs = new Set([...Object.keys(receivedNum), ...Object.keys(sentNum)]);
    const updateNotifications = [...notificationIDs].map((elemets) => {
      return { id: elemets, received_num: receivedNum[elemets] || 0, sent_num: sentNum[elemets] || 0 };
    });
    for (let notification of updateNotifications) {
      try {
        await Notification.updateNotificationNum(notification['id'], notification['sent_num'], notification['received_num']);
      } catch (error) {
        console.error(`[Update Error] Update notification ${notification['id']} error: %o`, error);
      }
    }

    await Cache.del(`receivedNum:${hourToCheck}`);
    await Cache.del(`sentNum:${hourToCheck}`);
  } catch (error) {
    console.error('[updateNotificationReceived] error: %o', error);
  } finally {
    await pool.end();
    await Cache.disconnect();
    console.info('[updateNotificationReceived] End check');
    return process.exit(0);
  }
};

updateNotificationReceived();
