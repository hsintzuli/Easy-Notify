const { pool } = require('./mysqlcon');

const getBusinessByID = async (app_id) => {
  const [results] = await pool.query('SELECT email, public_key, private_key FROM business WHERE app_id = ?', app_id);
  return results[0];
};

module.exports = {
  getBusinessByID,
};
