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
  ttl: {
    type: Number,
  },
  userIDs: {
    type: Array,
  },
});

const Content = mongoose.model('Content', contentSchema);
module.exports = Content;
