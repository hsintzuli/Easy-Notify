const webpush = require('web-push');
const { publicKey, privateKey } = process.env;
const rabbitmqLib = require('../../utils/rabbit');
const { DELAY_EXCHANGE } = process.env;

// InitConnection of rabbitmq
rabbitmqLib.initConnection(() => {
  // start Publisher when the connection to rabbitmq has been made
  rabbitmqLib.startPublish();
});

const genKey = async (req, res) => {
  const key = webpush.generateVAPIDKeys();
  publicVapidKey = key.publicKey;
  privateVapidKey = key.publicKey;
  console.log('key');
  return res.json(key);
};

// Subscribe Route
const subscribe = async (req, res) => {
  console.log(DELAY_EXCHANGE);
  const { subscription, payload, delay, ttl } = req.body;
  console.log(delay);

  const jobOptions = {
    headers: { 'x-delay': `${delay * 1000}` },
    contentType: 'application/json',
  };
  console.log(payload);
  console.log('receive subscription', subscription);
  const vapidDetails = {
    subject: 'mailto:test@test.com',
    publicKey: publicKey,
    privateKey: privateKey,
  };
  const newJob = { subscription, payload: JSON.stringify(payload), option: { vapidDetails, TTL: ttl } };
  await rabbitmqLib.publishMessage(DELAY_EXCHANGE, '', JSON.stringify(newJob), jobOptions);
  // Send 201 - resource created
  res.status(201).json({});

  // // Pass object into sendNotification
  // return webpush.sendNotification(subscription, JSON.stringify(payload), { vapidDetails, TTL: ttl }).catch((err) => console.error(err));
};

module.exports = {
  genKey,
  subscribe,
};
