const { MONGO_HOST, MONGO_USERNAME, MONGO_PASSWORD, MONGO_DATABASE } = process.env;
const mongoose = require('mongoose');

const connect = () => {
  mongoose.connect(`mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}:27017/${MONGO_DATABASE}?authSource=admin`);
  const mongodb = mongoose.connection;
  mongodb.on('error', console.error.bind(console, 'Mongo connection error:'));
  mongodb.once('open', function () {
    console.log('Mongo Connection Successful!');
  });
};

module.exports = {
  connect,
};
