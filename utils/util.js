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
    return res.status(403).send({ error: 'Forbidden' });
  }
  const channel = await Channel.getChannelDetail(channel_id);
  console.debug('[setChannelDataToReq] set data of channel to req.local %o', channel);
  req.locals = { channel };
  return next();
};

// Authentication for API Key
const apiAuthentication = async (req, res, next) => {
  // check Authorization header
  const channelId = req.get('X-CHANNEL-ID');
  const channelKey = req.get('X-API-KEY');

  console.debug(`[apiAuthentication] channelId: ${channelId}; channelKey: ${channelKey}`);
  if (!channelId || !channelKey) {
    res.status(401).send({ error: 'Unauthorized' });
    return;
  }

  const channelWithKey = await Channel.getChannelKey(channelKey);
  if (!channelWithKey || channelWithKey.channel_id !== channelId) {
    res.status(403).send({ error: 'Forbidden' });
    return;
  }
  // check whether the key is the correct one
  const channel = await Channel.getChannelDetail(channelId);
  console.debug(`[apiAuthentication] channelId: ${channelId} pass authentication`);
  req.locals = { channel };
  next();
};

module.exports = {
  wrapAsync,
  userAuthentication,
  apiAuthentication,
  setChannelDataToReq,
};
