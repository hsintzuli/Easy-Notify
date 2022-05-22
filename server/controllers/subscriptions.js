require('dotenv').config();
const webpush = require('web-push');
const Subscription = require('../models/subscriptions');
const Cache = require('../../utils/cache');
const Channel = require('../models/channels');

const subscribe = async (req, res) => {
  const { channel_id, subscription } = req.body;
  const channel = await Channel.getChannelById(channel_id);
  console.debug('[subscribe] receive subscription to channel:', channel);
  if (!channel || !subscription || !subscription.endpoint || !subscription.keys) {
    return res.status(400).json({ error: 'Wrong Request' });
  }
  const id = await Subscription.createClient(channel_id, subscription.endpoint, subscription.expirationTime, JSON.stringify(subscription.keys));
  console.debug('[subscribe] Create subscription successfully with id:', id);
  res.status(200).json({ status: 'success' });

  // Auth for subcription
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

  await webpush.sendNotification(subscription, JSON.stringify(payload), option);
  return;
};

const verifySubscription = async (req, res) => {
  const { code } = req.query;
  const condition = { status: 1 };
  const id = await Subscription.updateClient(code, condition);
  return res.status(200).json({ status: 'success' });
};

const cancelSubscription = async (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) {
    return res.status(400).json({ error: 'Wrong Request' });
  }

  console.debug('[cancelSubscription] receive cancellation of subscription:', endpoint);
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
  console.debug('[trackNotification] track subscription to notification with ID:', id);
  const now = new Date();
  const hourToCheck = now.getHours() % 2 === 0 ? 'even' : 'odd';
  await Cache.hincrby(`receivedNum:${hourToCheck}`, id, 1);
  res.status(200).json({ status: 'success' });
  return;
};

const addTagForSubscription = async (req, res) => {
  const { channel_id, endpoint, tag } = req.body;
  if (!channel_id || !endpoint || !tag) {
    res.status(400).json({ error: 'Wrong Request' });
    return;
  }
  await Subscription.updateClientTag(channel_id, endpoint, tag);
  res.status(200).json({ status: 'success' });
  return;
};

const removeTagForSubscription = async (req, res) => {
  const { channel_id, endpoint } = req.body;
  if (!channel_id || !endpoint) {
    res.status(400).json({ error: 'Wrong Request' });
    return;
  }
  await Subscription.updateClientTag(channel_id, endpoint, null);
  res.status(200).json({ status: 'success' });
  return;
};

module.exports = {
  subscribe,
  verifySubscription,
  cancelSubscription,
  trackNotification,
  addTagForSubscription,
  removeTagForSubscription,
};
