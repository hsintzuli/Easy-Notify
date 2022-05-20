require('dotenv').config();
const App = require('../../models/apps');
const Channel = require('../../models/channels');
const Notification = require('../../models/notifications');
const Subscription = require('../../models/subscriptions');

const checkUserInSession = async (req, res, next) => {
  const { user } = req.session;
  if (!user) {
    return res.redirect('/signin');
  }
  return next();
};

const signOut = async (req, res) => {
  req.session.destroy();
  return res.redirect('/');
};

const apps = async (req, res) => {
  const { user } = req.session;
  const apps = await App.getApps(user.id);
  return res.render('apps', { user, apps });
};

const channels = async (req, res) => {
  const { user } = req.session;
  const { app_id } = req.query;
  const verified = await App.verifyAppWithUser(user.id, app_id);
  if (!verified) {
    return res.redirect('/signin');
  }
  const channels = await Channel.getChannelsWithKeys(app_id);
  console.log(channels);
  return res.render('channels', { user, channels, moment: require('moment') });
};

const sendNotificaton = async (req, res) => {
  const { user } = req.session;
  const channels = await Channel.getChannelsByUser(user.id);

  const channelGroupByApp = channels.reduce((prev, curr) => {
    let app = `[${curr.app_name}]-${curr.app_id}`;
    if (!prev.hasOwnProperty(app)) prev[app] = { icon: curr.icon, channels: [] };
    console.log(prev);
    prev[app]['channels'].push(`[${curr.name}]-${curr.id}`);
    return prev;
  }, {});
  console.log(channelGroupByApp);

  res.render('sendnotification', { user, apps: Object.keys(channelGroupByApp), channelGroupByApp });
};

const createApp = async (req, res) => {
  const { user } = req.session;
  res.render('createApp', { user });
};

const dashboard = async (req, res) => {
  const { user } = req.session;

  const notificationSent = await Notification.getNotificationSent(user.id);
  const clientCount = await Subscription.getClientCountByUser(user.id);
  const onlineClient = await Notification.getMaxOnlineClient(user.id);
  const newClient = await Subscription.getLastlyClientByUser(user.id);
  const dashboardData = {
    subscribers: clientCount && clientCount.total_client ? clientCount.total_client.toLocaleString() : 0,
    maxOnlineClients: onlineClient && onlineClient.max_online_clients ? onlineClient.max_online_clients.toLocaleString() : 0,
    notificationSent: notificationSent && notificationSent.notification_sent ? notificationSent.notification_sent.toLocaleString() : 0,
    deleveredRate: notificationSent && notificationSent.delivered_rate ? Math.floor(notificationSent.delivered_rate * 100) : 0,
    newClients: newClient && newClient.new_clients ? newClient.new_clients : 0,
    activatedClients: newClient && newClient.activated_user ? newClient.activated_user : 0,
    apps: notificationSent && notificationSent.apps ? notificationSent.apps : 0,
  };

  res.render('dashboard', { user, dashboardData });
};

const reports = async (req, res) => {
  const { user } = req.session;
  const apps = await App.getApps(user.id);

  res.render('reports', { user, apps });
};

const reportNotification = async (req, res) => {
  const { user } = req.session;
  const { id } = req.query;

  res.render('notification-reports', { user, id });
};

module.exports = {
  signOut,
  apps,
  channels,
  sendNotificaton,
  createApp,
  dashboard,
  reports,
  reportNotification,
  checkUserInSession,
};
