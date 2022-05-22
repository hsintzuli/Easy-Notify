const path = require('path');
require('dotenv').config(path.resolve(__dirname + '/../.env'));
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, errors } = format;
const { LOG_LEVEL } = process.env;

const myFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

const setLogger = (errorFile) => {
  const logger = createLogger({
    level: LOG_LEVEL,
    format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), format.splat(), format.json(), myFormat),
    transports: [new transports.Console()],
  });

  if (errorFile) {
    logger.transports.push(new transports.File({ filename: errorFile, level: 'error' }));
  }

  console.log = (...args) => logger.info.call(logger, ...args);
  console.info = (...args) => logger.info.call(logger, ...args);
  console.warn = (...args) => logger.warn.call(logger, ...args);
  console.error = (...args) => logger.error.call(logger, ...args);
  console.debug = (...args) => logger.debug.call(logger, ...args);

  return logger;
};
module.exports = { setLogger };
