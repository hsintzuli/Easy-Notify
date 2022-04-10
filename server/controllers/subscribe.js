require('dotenv').config();
const subscribe_model = require('../models/subscribe');

const subscribe = async (req, res) => {
  const { app_id, subscription } = req.body;
  console.log('receive subscription', subscription);
  const id = await subscribe_model.createClient(app_id, subscription.endpoint, subscription.expirationTime, JSON.stringify(subscription.keys));
  return res.status(200).json({ id });
};

module.exports = {
  subscribe,
};
