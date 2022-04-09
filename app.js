require('dotenv').config();
const { PORT, API_VERSION } = process.env;

// Express Initialization
const express = require('express');
const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/' + API_VERSION, [require('./server/routes/client')]);

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
