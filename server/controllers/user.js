const webpush = require('web-push');

const genKey = async (req, res) => {
  const key = webpush.generateVAPIDKeys();
  console.log('key', key);
  return res.json({ key });
};

module.exports = {
  genKey,
};
