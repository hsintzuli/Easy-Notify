require('dotenv').config();
const User = require('../models/users');
const Order = require('../models/orders');
const Subscription = require('../models/subscriptions');
const { UserSchema } = require('../../utils/validators');
const TimeUtils = require('../../utils/timeUtils');
const { TAPPAY_PARTNER_KEY, TAPPAY_MERCHANT_ID } = process.env;

const validateUser = async (req, res, next) => {
  try {
    const validated = await UserSchema.validateAsync(req.body);
    req.body = validated;
    return next();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const signUp = async (req, res) => {
  const { name, email, password } = req.body;
  const result = await User.signUp(name, email, password);
  if (result.error) {
    res.status(403).send({ error: 'The email is already in use' });
    return;
  }

  const user = result.user;
  if (!user) {
    res.status(500).send({ error: 'Database Query Error' });
    return;
  }
  console.debug('[SignUp] user sign up : %o', user);
  req.session.user = { id: user.id, name: user.name };
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
    return res.status(400).json({ error: 'Request Error: email and password are required.' });
  }
  const result = await User.signIn(email, password);
  if (result.error) {
    res.status(403).send({ error: 'Incorrect email or password.' });
    return;
  }
  const user = result.user;
  console.debug('[SignIn] user sign in : %o', user);
  if (!user) {
    res.status(500).json({ error: 'Database Query Error' });
    return;
  }
  req.session.user = { id: user.id, name: user.name };

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

const getNewSubscribers = async (req, res) => {
  const { user } = req.session;
  let { start_date, end_date } = req.body;
  if (!start_date || !end_date) {
    res.status(400).send({ error: 'Get New Subscribers Error: Wrong Data Format' });
    return;
  }

  [start_date, end_date] = TimeUtils.generateValidDatetimeRange(start_date, end_date);
  const interval = TimeUtils.calDiffInterval(start_date, end_date);
  const data = await Subscription.getClientGroupByDate(user.id, start_date, end_date, interval);
  console.debug('[getNewSubscribers] Get clients group by date : %o', data);
  res.status(200).send({
    data,
  });
};

const createOrder = async (req, res) => {
  const { user } = req.session;
  const { plan_id, prime, start_date } = req.body;
  if (!plan_id || !prime) {
    res.status(400).send({ error: 'Create Order Error: Wrong Data Format' });
    return;
  }
  const now = new Date();
  const number = '' + now.getMonth() + now.getDate() + (now.getTime() % (24 * 60 * 60 * 1000)) + Math.floor(Math.random() * 10);
  const orderRecord = {
    id: number,
    user_id: user.id,
    plan_id: plan_id,
    start_date: start_date || now,
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
  validateUser,
  signUp,
  signIn,
  createOrder,
  getNewSubscribers,
};
