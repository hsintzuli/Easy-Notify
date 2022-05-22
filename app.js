require('dotenv').config();
const { PORT, API_VERSION } = process.env;
const session = require('express-session');
const cors = require('cors');
require('./logger/index').setLogger('app_error.log');
require('./utils/cache');
require('./server/models/mongoconn')
  .connect()
  .catch((error) => {
    console.error('MongoDB create connection error:', error);
  });
require('./utils/rabbit')
  .connect()
  .catch((error) => {
    console.error('RabbitMQ create connection error:', error);
  });

// Express Initialization
const express = require('express');
const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    name: 'user',
    resave: false,
  })
);
app.set('view engine', 'pug');
app.set('views', './server/views');

// Routes for server side render
app.use([require('./server/routes/pages/home'), require('./server/routes/pages/management')]);

app.use(cors());
// API routes for user operation on webpage
app.use('/api/' + API_VERSION, [require('./server/routes/api/subscription'), require('./server/routes/api/user'), require('./server/routes/api/apps')]);

// API route for client side library
app.use('/api/' + API_VERSION, require('./server/routes/api/notification'));

// API route for operations on notification using channelID & channelKey
app.use('/notifier/api/' + API_VERSION, [require('./server/routes/notifier')]);

// Page not found
app.use((req, res) => {
  res.sendStatus(404);
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  err.status = err.status || 500;
  res.status(err.status);
  console.error('[Uncaught error] %o:', err);
  res.statys(err.status).json({
    status: err.status,
    error: 'Please contact the server administrator',
  });
});

app.listen(PORT, async () => {
  console.info(`Listening on port: ${PORT}`);
});
