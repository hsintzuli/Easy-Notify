require('dotenv').config();
const { pool } = require('./mysqlcon');

const createOrder = async (order, plan_id, tappayKey, tappayId, prime) => {
  const [plans] = await pool.query('SELECT price_m, period FROM plans WHERE id = ?', plan_id);
  if (plans.length === 0) {
    return { error: 'Wrong plan id' };
  }

  const plan = plans[0];
  order.total = plan.price_m * plan.period;

  if (order.total) {
    const paymentResult = payOrderByPrime(tappayKey, tappayId, prime, order);
    if (paymentResult.status != 0) {
      return { error: 'Invalid prime' };
    }
  }

  const start_date = new Date(order.start_date);
  order.end_date = new Date(start_date.setMonth(start_date.getMonth() + plan.period));

  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION');
    await conn.query('INSERT INTO order_table SET ?', order);
    await conn.query('UPDATE user SET billing=?, start_date=?, expire_date=? WHERE id = ?', [plan_id, order.start_date, order.end_date, order.user_id]);
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
