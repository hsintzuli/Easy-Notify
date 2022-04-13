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
      throw new Error('Email Already Exists');
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
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION');
    const [users] = await conn.query('SELECT * FROM user WHERE email = ? FOR UPDATE', [email]);
    const user = users[0];
    if (!bcrypt.compareSync(password, user.password)) {
      throw new Error('Password is wrong');
    }

    user.login_at = new Date();
    await conn.query('UPDATE user SET login_at = ? WHERE id = ?', [user.login_at, user.id]);
    await conn.query('COMMIT');
    return { user };
  } catch (error) {
    await conn.query('ROLLBACK');
    return { error };
  } finally {
    await conn.release();
  }
};

module.exports = {
  signIn,
  signUp,
};
