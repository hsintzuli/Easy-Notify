require('dotenv').config();
const App = require('../models/apps');
const Channel = require('../models/channels');
const Notification = require('../models/notifications');
const Subscription = require('../models/subscriptions');

const apps = async (req, res) => {
  const { user } = req.session;
  console.log(user);
  if (!user) {
    return res.redirect('/signin');
  }
  const apps = await App.getApps(user.id);
  console.log('select apps', apps);
  return res.render('apps', { user, apps });
};

const channels = async (req, res) => {
  const { user } = req.session;
  const { app_id } = req.query;
  if (!user) {
    return res.redirect('/signin');
  }
  const verified = await App.verifyAppWithUser(user.id, app_id);
  if (!verified) {
    return res.redirect('/signin');
  }
  const channels = await Channel.getChannels(app_id);
  console.log(channels);
  return res.render('channels', { user, channels });
};

const sendNotificaton = async (req, res) => {
  console.log('in');
  const { user } = req.session;
  if (!user) {
    return res.redirect('/signin');
  }
  const channels = await Channel.getChannelsByUser(user.id);
  const channelGroupByApp = channels.reduce((prev, curr) => {
    let app = `${curr.app_name}::${curr.app_id}`;
    if (!prev.hasOwnProperty(app)) prev[app] = [];
    prev[app].push(`${curr.name}::${curr.id}`);
    return prev;
  }, {});
  console.log(channelGroupByApp);

  res.render('sendnotification', { user, apps: Object.keys(channelGroupByApp), channelGroupByApp });
};

const createApp = async (req, res) => {
  const { user } = req.session;
  if (!user) {
    return res.redirect('/signin');
  }
  res.render('createApp', { user });
};

const dashboard = async (req, res) => {
  const { user } = req.session;
  if (!user) {
    return res.redirect('/signin');
  }
  const notificationSent = await Notification.getNotificationSent(user.id);
  const clientCount = await Subscription.getClientCountByUser(user.id);
  const onlineClient = await Notification.getMaxOnlineClient(user.id);
  console.log(clientCount);
  const dashboardData = {
    subscribers: clientCount && clientCount.total_client ? clientCount.total_client.toLocaleString() : 0,
    maxOnlineClients: onlineClient && onlineClient.max_online_clients ? onlineClient.max_online_clients.toLocaleString() : 0,
    notificationSent: notificationSent && notificationSent.notification_sent ? notificationSent.notification_sent.toLocaleString() : 0,
    deleveredRate: notificationSent && notificationSent.delivered_rate ? Math.floor(notificationSent.delivered_rate * 100) : 0,
  };
  console.log('user:', user);
  console.log(dashboardData);
  res.render('dashboard', { user, dashboardData });
};

const reports = async (req, res) => {
  const { user } = req.session;
  if (!user) {
    return res.redirect('/signin');
  }
  const apps = await App.getApps(user.id);
  console.log(apps);

  res.render('reports', { user, apps });
};

const reportNotification = async (req, res) => {
  const { user } = req.session;
  if (!user) {
    return res.redirect('/signin');
  }

  res.render('notification-reports', { user });
};

module.exports = {
  apps,
  channels,
  sendNotificaton,
  createApp,
  dashboard,
  reports,
  reportNotification,
};
