require('dotenv').config();
const webpush = require('web-push');
const Subscription = require('../models/subscription');
const Cache = require('../../utils/cache');
const Channel = require('../models/channel');

const subscribe = async (req, res) => {
  const { channel_id, subscription } = req.body;
  const channel = await Channel.getChannelById(channel_id);
  console.log('receive subscription', channel);
  if (!channel || !subscription || !subscription.endpoint || !subscription.keys) {
    return res.status(400).json({ error: 'Wrong Request' });
  }
  const id = await Subscription.createClient(channel_id, subscription.endpoint, subscription.expirationTime, JSON.stringify(subscription.keys));
  res.status(200).json({ status: 'success' });
  console.log(id);
  const vapidDetails = {
    subject: `mailto:${channel.email}`,
    publicKey: channel.public_key,
    privateKey: channel.private_key,
  };
  const payload = {
    title: 'auth',
    code: id,
  };
  const option = {
    vapidDetails,
    TTL: 0,
  };

  await webpush.sendNotification(subscription, JSON.stringify(payload), option).catch((err) => console.error(err));
  return;
};

const verifySubscription = async (req, res) => {
  console.log('here');
  const { code } = req.query;
  const condition = { status: 1 };
  const id = await Subscription.updateClient(condition, code);
  return res.status(200).json({ status: 'success' });
};

const cancelSubscription = async (req, res) => {
  console.log(req.body);
  const { endpoint } = req.body;
  console.log('receive cancellation', endpoint);
  if (!endpoint) {
    return res.status(400).json({ error: 'Wrong Request' });
  }
  const removeSuccess = await Subscription.removeClient(endpoint);
  if (removeSuccess) {
    res.status(200).json({ status: 'success' });
    return;
  }
  res.status(201).json({ status: 'failed' });
  return;
};

const trackNotification = async (req, res) => {
  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: 'Wrong Request' });
    return;
  }
  await Cache.hincrby('receivedNum', id, 1);

  res.status(200).json({ status: 'success' });
  return;
};

module.exports = {
  subscribe,
  verifySubscription,
  cancelSubscription,
  trackNotification,
};
