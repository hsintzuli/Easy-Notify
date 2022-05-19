const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const errorNotificationSchema = new Schema({
  log: {
    type: String,
  },
  created_dt: { type: Date, default: Date.now },
});

const ErrorNotification = mongoose.model('ErrorNotification', errorNotificationSchema);

const createErrorLog = async (log) => {
  if (typeof log === 'Object') {
    log = JSON.stringify(log);
  }
  try {
    // Save notification error log
    const errorNotification = new ErrorNotification({
      log: log,
    });
    const result = await errorNotification.save();
    return { data: result._id.toString() };
  } catch (error) {
    console.error('[createErrorNotification] error', error);
    return { error };
  }
};
module.exports = {
  createErrorLog,
};
