require('dotenv').config();
const { pool } = require('./mysqlcon');

const createOrder = async (order, plan_id, tappayKey, tappayId, prime) => {
  const [plans] = await pool.query('SELECT price_m, notification_limit, subscription_limit FROM plans WHERE id = ?', plan_id);
  if (plans.length === 0) {
    return { error: 'Wrong plan id' };
  }

  order.total = plans[0].price_m;

  if (order.total) {
    const paymentResult = payOrderByPrime(tappayKey, tappayId, prime, order);
    if (paymentResult.status != 0) {
      return { error: 'Invalid prime' };
    }
  }

  const start_date = new Date(order.start_date);
  const end_date = new Date(start_date.setMonth(start_date.getMonth() + 1));
  order.end_date = end_date;

  const updateUser = {
    plan_id: plan_id,
    start_date: start_date,
    expire_date: end_date,
    notification_num: 0,
    subscription_num: 0,
  };

  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION');
    await conn.query('INSERT INTO orders SET ?', order);
    await conn.query('UPDATE users SET ? WHERE id = ?', [updateUser, order.user_id]);
    await conn.query('COMMIT');
    return { order };
  } catch (error) {
    await conn.query('ROLLBACK');
    console.log(error);
    return { error };
  } finally {
    conn.release();
  }
};

const payOrderByPrime = async function (tappayKey, tappayId, prime, order) {
  let res = await got.post('https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime', {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': tappayKey,
    },
    json: {
      prime: prime,
      partner_key: tappayKey,
      merchant_id: tappayId,
      details: 'Stylish Payment',
      amount: order.total,
      cardholder: {
        phone_number: 0900000123,
        name: order.user.name,
        email: order.recipient.email,
      },
      remember: false,
    },
    responseType: 'json',
  });
  return res.body;
};

module.exports = {
  createOrder,
  payOrderByPrime,
};
