require('dotenv').config();
const mysql = require('mysql2/promise');
const { SQL_HOST, SQL_USERNAME, SQL_PASSWORD, SQL_DATABASE } = process.env;

const mysqlConfig = {
  host: SQL_HOST,
  user: SQL_USERNAME,
  password: SQL_PASSWORD,
  database: SQL_DATABASE,
};

const pool = mysql.createPool(mysqlConfig);
console.info('[Mysql] successfully connected');

module.exports = {
  mysql,
  pool,
};
