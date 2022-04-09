const webpush = require('web-push');
const { publicKey, privateKey } = process.env;

const genKey = async (req, res) => {
  const key = webpush.generateVAPIDKeys();
  publicVapidKey = key.publicKey;
  privateVapidKey = key.publicKey;
  console.log('key');
  return res.json(key);
};

// Subscribe Route
const subscribe = async (req, res) => {
  const { subscription, payload, delay, ttl } = req.body;
  console.log(payload);
  console.log('receive subscription', subscription);
  const vapidDetails = {
    subject: 'mailto:test@test.com',
    publicKey: publicKey,
    privateKey: privateKey,
  };
  // Send 201 - resource created
  res.status(201).json({});

  // Pass object into sendNotification
  return webpush.sendNotification(subscription, JSON.stringify(payload), { vapidDetails, TTL: ttl }).catch((err) => console.error(err));
};

module.exports = {
  genKey,
  subscribe,
};
