require('dotenv').config();
const User = require('../models/user');
const Order = require('../models/order');
const { TAPPAY_PARTNER_KEY, TAPPAY_MERCHANT_ID } = process.env;

const signUp = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).send({ error: 'Request Error: name, email and password are required.' });
    return;
  }

  const result = await User.signUp(name, email, password);
  if (result.error) {
    res.status(403).send({ error: result.error });
    return;
  }

  const user = result.user;
  if (!user) {
    res.status(500).send({ error: 'Database Query Error' });
    return;
  }
  req.session.user = user.id;

  res.status(200).send({
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    },
  });
};

const signIn = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return { error: 'Request Error: email and password are required.', status: 400 };
  }
  const result = await User.signIn(email, password);
  if (result.error) {
    res.status(403).send({ error: result.error });
    return;
  }

  const user = result.user;
  if (!user) {
    res.status(500).send({ error: 'Database Query Error' });
    return;
  }
  req.session.user = user.id;

  res.status(200).send({
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    },
  });
};

const createOrder = async (req, res) => {
  const user_id = req.session.user;
  const { plan_id, prime } = req.body;
  if (!plan_id || !prime) {
    res.status(400).send({ error: 'Create Order Error: Wrong Data Format' });
    return;
  }
  const now = new Date();
  const number = '' + now.getMonth() + now.getDate() + (now.getTime() % (24 * 60 * 60 * 1000)) + Math.floor(Math.random() * 10);
  const orderRecord = {
    id: number,
    user_id: user_id,
    plan_id: plan_id,
    start_date: now,
  };
  const result = await Order.createOrder(orderRecord, plan_id, TAPPAY_PARTNER_KEY, TAPPAY_MERCHANT_ID, prime);
  if (result.error) {
    res.status(403).send({ error: result.error });
    return;
  }

  const order = result.order;
  if (!order) {
    res.status(500).send({ error: 'Database Query Error' });
    return;
  }
  res.status(200).send({
    data: {
      order_number: order.id,
    },
  });
};

module.exports = {
  signUp,
  signIn,
  createOrder,
};
