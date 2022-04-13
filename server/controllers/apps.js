require('dotenv').config();
const App = require('../models/apps');
const Channel = require('../models/channel');
const KET_EXPIRE_S = 60 * 60 * 24 * 60;

const createApp = async (req, res) => {
  const { user } = req.session;
  const { name } = req.body;
  console.log(user, name);
  const app_id = await App.createApp(user, name);
  return res.status(200).json({ data: { app_id } });
};

const getApps = async (req, res) => {
  const { user } = req.session;
  const { app_id } = req.query;
  if (!app_id) {
    const apps = await App.getApps(user);
    console.log(apps);
    return res.status(200).json({ data: apps });
  }
  const verified = await App.verifyAppWithUser(user, app_id);
  if (!verified) {
    return res.status(400).json({ error: 'Incorrect user or app id' });
  }
  const app = await App.getAppDetail(app_id);
  return res.status(200).json({ data: app });
};

const createChannel = async (req, res) => {
  const { user } = req.session;
  const { app_id, name, description } = req.body;
  const verified = await App.verifyAppWithUser(user, app_id);
  if (!verified) {
    return res.status(400).json({ error: 'Incorrect user or app id' });
  }
  const channel = await Channel.createChannel(app_id, name, description);
  return res.status(200).json({ data: channel });
};

const deleteChannel = async (req, res) => {
  const { user } = req.session;
  const { channel_id } = req.query;
  const verified = await Channel.verifyChannelWithUser(user, channel_id);
  if (!verified) {
    return res.status(400).json({ error: 'Incorrect user or channel id' });
  }

  const result = await Channel.deleteChannel(channel_id);
  return res.status(200).json({ ok: result });
};

const rotateChannelKey = async (req, res) => {
  const { user } = req.session;
  const { channel_id } = req.query;
  const verified = await Channel.verifyChannelWithUser(user, channel_id);
  if (!verified) {
    return res.status(400).json({ error: 'Incorrect user or channel id' });
  }

  const now = new Date();
  const key_expire_dt = new Date(now.getTime() + KET_EXPIRE_S * 1000);
  const channel = await Channel.updateChannelKey(channel_id, key_expire_dt);
  return res.status(200).json({ data: channel });
};

module.exports = {
  createApp,
  getApps,
  createChannel,
  deleteChannel,
  rotateChannelKey,
};
