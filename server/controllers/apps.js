require('dotenv').config();
const App = require('../models/apps');
const Channel = require('../models/channels');
const { AppSchema, ChannelSchema } = require('../../utils/validators');
const KET_EXPIRE_S = 60 * 60 * 24 * 7;

const validateApp = async (req, res, next) => {
  try {
    const validated = await AppSchema.validateAsync(req.body, {
      allowUnknown: true,
    });
    req.body = validated;
    return next();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const createApp = async (req, res) => {
  const { user } = req.session;
  const { name, description, contact_email, default_icon } = req.body;
  console.log(`${user.id} create app: ${name}`);
  const result = await App.createApp(user.id, name, description, contact_email, default_icon);
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  return res.status(200).json({ data: { app_id: result.app_id } });
};

const archiveApp = async (req, res) => {
  const { user } = req.session;
  const { app_id } = req.query;
  console.log(`${user.id} archive app: ${app_id}`);
  const verified = await App.verifyAppWithUser(user.id, app_id);
  if (!verified) {
    return res.status(400).json({ error: 'Incorrect user or app id' });
  }

  const isArchiveSuccess = await App.archiveApp(app_id);
  return res.status(200).json({ ok: isArchiveSuccess });
};

const getApps = async (req, res) => {
  const { user } = req.session;
  const { app_id } = req.query;
  if (!app_id) {
    const apps = await App.getApps(user.id);
    console.log(apps);
    return res.status(200).json({ data: apps });
  }
  const verified = await App.verifyAppWithUser(user.id, app_id);
  if (!verified) {
    return res.status(400).json({ error: 'Incorrect user or app id' });
  }
  const app = await App.getAppDetail(app_id);
  return res.status(200).json({ data: app });
};

const validateChannel = async (req, res, next) => {
  try {
    const validated = await ChannelSchema.validateAsync(req.body, {
      allowUnknown: true,
    });
    req.body = validated;
    return next();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const createChannel = async (req, res) => {
  console.log('Post Channel:', req.body);
  const { user } = req.session;
  const { app_id, name } = req.body;
  const verified = await App.verifyAppWithUser(user.id, app_id);
  if (!verified) {
    return res.status(400).json({ error: 'Incorrect user or app id' });
  }
  const result = await Channel.createChannel(app_id, name);
  if (result.error) {
    return res.status(500).json({ error: 'Fail to create channel' });
  }
  return res.status(200).json({ data: result.channel });
};

const deleteChannel = async (req, res) => {
  const { user } = req.session;
  const { channel_id } = req.query;
  const verified = await Channel.verifyChannelWithUser(user.id, channel_id);
  if (!verified) {
    return res.status(400).json({ error: 'Incorrect user or channel id' });
  }

  const result = await Channel.deleteChannel(channel_id);
  return res.status(200).json({ ok: result });
};

const rotateChannelKey = async (req, res) => {
  const { user } = req.session;
  const { channel_id } = req.query;
  console.log('rotate', user, channel_id);
  const verified = await Channel.verifyChannelWithUser(user.id, channel_id);
  if (!verified) {
    console.log('error');
    return res.status(400).json({ error: 'Incorrect user or channel id' });
  }

  const now = new Date();
  const key_expire_dt = new Date(now.getTime() + KET_EXPIRE_S * 1000);
  const channel = await Channel.updateChannelKey(channel_id, key_expire_dt);
  return res.status(200).json({ data: channel });
};

module.exports = {
  validateApp,
  createApp,
  getApps,
  archiveApp,
  validateChannel,
  createChannel,
  deleteChannel,
  rotateChannelKey,
};
