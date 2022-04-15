const Channel = require('../server/models/channel');

// reference: https://thecodebarbarian.com/80-20-guide-to-express-error-handling
const wrapAsync = (fn) => {
  return function (req, res, next) {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    fn(req, res, next).catch(next);
  };
};

const userAuthentication = async function (req, res, next) {
  console.log('in');
  if (!req.session.user) {
    res.status(403).send({ error: 'Forbidden' });
    return;
  }
  next();
};

const apiAuthentication = async (req, res, next) => {
  let accessToken = req.get('Authorization');
  console.log(accessToken);
  if (!accessToken) {
    res.status(401).send({ error: 'Unauthorized' });
    return;
  }

  const [channelId, channelKey] = accessToken.split(':');
  console.log(channelId, channelKey);
  if (!channelId || !channelKey) {
    res.status(401).send({ error: 'Unauthorized' });
    return;
  }

  const channel = await Channel.getChannelById(channelId);
  console.log(channel);
  if (!channel || channel.channel_key !== channelKey) {
    res.status(403).send({ error: 'Forbidden' });
    return;
  }
  req.locals = { channel };
  next();
};

module.exports = {
  wrapAsync,
  userAuthentication,
  apiAuthentication,
};
