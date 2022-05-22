require('dotenv').config({ path: __dirname + '/../.env' });
const { WORKERS_ERROR_FILE_PATH } = process.env;
require('../logger/index').setLogger(WORKERS_ERROR_FILE_PATH);

const { pool } = require('./../server/models/mysqlcon');

(async function () {
  try {
    console.info('[deleteExpiredKeys] Start to delete expired keys');
    const [results] = await pool.query('DELETE FROM channel_keys WHERE key_expire_dt <= NOW()');
    console.info('[deleteExpiredKeys] the numbers of deleted keys: %s', results.affectedRows);
  } catch (error) {
    console.error('[deleteExpiredKeys] Publish Error: %o', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
})();
