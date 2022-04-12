require('dotenv').config();
const bcrypt = require('bcrypt');
const { pool } = require('./mysqlcon');
const salt = parseInt(process.env.BCRYPT_SALT);

const signUp = async (name, email, password) => {
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION');

    const emails = await conn.query('SELECT email FROM user WHERE email = ? FOR UPDATE', [email]);
    if (emails[0].length > 0) {
      await conn.query('COMMIT');
      return { error: 'Email Already Exists' };
    }

    const loginAt = new Date();

    const user = {
      email: email,
      password: bcrypt.hashSync(password, salt),
      name: name,
      login_at: loginAt,
    };

    const queryStr = 'INSERT INTO user SET ?';
    const [result] = await conn.query(queryStr, user);

    user.id = result.insertId;
    await conn.query('COMMIT');
    return { user };
  } catch (error) {
    console.log(error);
    await conn.query('ROLLBACK');
    return { error };
  } finally {
    await conn.release();
  }
};

const signIn = async (email, password) => {
  try {
    await pool.query('START TRANSACTION');

    const [users] = await pool.query('SELECT * FROM user WHERE email = ?', [email]);
    const user = users[0];
    if (!bcrypt.compareSync(password, user.password)) {
      return { error: 'Password is wrong' };
    }

    user.login_at = new Date();
    await pool.query('UPDATE user SET login_at = ? WHERE id = ?', [user.login_at, user.id]);
    console.log(user);
    return { user };
  } catch (error) {
    return { error };
  }
};

module.exports = {
  signIn,
  signUp,
};
