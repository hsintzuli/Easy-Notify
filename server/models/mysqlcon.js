require('dotenv').config();
const mysql = require('mysql2/promise');
const { SQL_HOST, SQL_USERNAME, SQL_PASSWORD, SQL_DATABASE } = process.env;

const mysqlConfig = {
  // for EC2 machine
  host: SQL_HOST,
  user: SQL_USERNAME,
  password: SQL_PASSWORD,
  database: SQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 20,
};

const pool = mysql.createPool(mysqlConfig);

module.exports = {
  mysql,
  pool,
};
