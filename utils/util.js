const Channel = require('../server/models/channels');
const moment = require('moment');

// reference: https://thecodebarbarian.com/80-20-guide-to-express-error-handling
const wrapAsync = (fn) => {
  return function (req, res, next) {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    fn(req, res, next).catch(next);
  };
};

// Authentication fo User Session
const userAuthentication = function (req, res, next) {
  if (!req.session.user) {
    res.status(401).send({ error: 'Unauthorized' });
    return;
  }
  next();
};

const setChannelDataToReq = async (req, res, next) => {
  const { user } = req.session;
  const { channel_id } = req.body;
  const verified = await Channel.verifyChannelWithUser(user.id, channel_id);
  if (!verified) {
    res.status(403).send({ error: 'Forbidden' });
  }
  const channel = await Channel.getChannelDetail(channel_id);
  console.log('setChannelDataToReq', channel);
  req.locals = { channel };
  return next();
};

// Authentication for API Key
const apiAuthentication = async (req, res, next) => {
  // check Authorization header
  const accessToken = req.get('Authorization');
  console.log(accessToken);
  if (!accessToken) {
    res.status(401).send({ error: 'Unauthorized' });
    return;
  }

  // check authorization header is correct format
  const [channelId, channelKey] = accessToken.split(':');
  console.log(channelId, channelKey);
  if (!channelId || !channelKey) {
    res.status(401).send({ error: 'Unauthorized' });
    return;
  }

  // check whether the key is the correct one
  const channel = await Channel.getChannelDetail(channelId);
  console.log(channel);
  if (!channel || channel.channel_key !== channelKey) {
    res.status(403).send({ error: 'Forbidden' });
    return;
  }
  req.locals = { channel };
  next();
};

const diffFromNow = (time) => {
  const targetTime = new Date(time);
  const now = new Date();
  console.log(targetTime.getTime());
  console.log(new Date(targetTime).toString());
  console.log(now.getTime());
  console.log(new Date(now).toString());
  return (targetTime.getTime() - now.getTime()) / 1000;
};

const generateValidDatetimeRange = (startDate, endDate) => {
  const now = new Date();
  startDate = startDate < endDate ? new Date(startDate) : new Date(endDate);
  endDate = startDate < endDate ? new Date(endDate) : new Date(startDate);
  if (moment(endDate).format('YYYY-MM-DD') >= moment(now).format('YYYY-MM-DD')) {
    endDate = now;
  } else {
    endDate = new Date(endDate.getTime() + (23 * 3600 + 59 * 60) * 1000);
  }

  return [startDate, endDate];
};

module.exports = {
  wrapAsync,
  userAuthentication,
  apiAuthentication,
  setChannelDataToReq,
  diffFromNow,
  generateValidDatetimeRange,
};
