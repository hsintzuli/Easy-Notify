require('dotenv').config();
const { PORT, API_VERSION } = process.env;
const session = require('express-session');
const cors = require('cors');
const Cache = require('./utils/cache');
const Mongo = require('./server/models/mongoconn');
Mongo.connect();

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
app.use(require('./server/routes/home'));
app.use(require('./server/routes/management'));

// API routes
app.use(cors());
app.use('/api/' + API_VERSION, [
  require('./server/routes/subscription'),
  require('./server/routes/notification'),
  require('./server/routes/user'),
  require('./server/routes/apps'),
]);

// Initialize Socket IO
// const http = require('http');
// const server = http.createServer(app);
// require('./utils/mysocket').config(server);

// Page not found
app.use((req, res, next) => {
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

app.listen(PORT, async () => {
  // require('./utils/websocketWorker').initializSocketWorker();
  console.log(`Listening on port: ${PORT}`);
});
