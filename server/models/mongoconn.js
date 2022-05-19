const { MONGO_HOST, MONGO_USERNAME, MONGO_PASSWORD, MONGO_DATABASE } = process.env;
const mongoose = require('mongoose');

const connect = async () => {
  await mongoose.connect(`mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}:27017/${MONGO_DATABASE}?authSource=admin`);
  console.log('Mongo Connection Successful!');
  const mongodb = mongoose.connection;
  mongodb.on('error', console.error.bind(console, 'Mongo connection error:'));
};

const disconnect = async () => {
  await mongoose.disconnect();
};

module.exports = {
  connect,
  disconnect,
};
