const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contentSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
  },
  config: {
    type: String,
  },
  vapid_detail: {
    type: Object,
  },
});

const Content = mongoose.model('Content', contentSchema);
module.exports = Content;
