require('dotenv').config();
const { PORT, API_VERSION } = process.env;
const mongoose = require('mongoose');
const { MONGO_HOST, MONGO_USERNAME, MONGO_PASSWORD, MONGO_DATABASE } = process.env;

mongoose.connect(`mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}:27017/${MONGO_DATABASE}?authSource=admin`);

const mongodb = mongoose.connection;
mongodb.on('error', console.error.bind(console, 'connection error:'));
mongodb.once('open', function () {
  console.log('Connection Successful!');
});

// Express Initialization
const express = require('express');
const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/' + API_VERSION, [require('./server/routes/client'), require('./server/routes/subscribe'), require('./server/routes/push')]);

// Page not found
app.use(function (req, res, next) {
  res.sendStatus(404);
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  err.status = err.status || 500;
  res.status(err.status);
  console.log(err);
  res.json({
    status: err.status,
    error: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server listening in port ${PORT}`);
});
