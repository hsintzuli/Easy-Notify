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
  optionMsg: {
    type: Object,
  },
  config: {
    type: Object,
  },
  clientIds: {
    type: Array,
  },
});

const Content = mongoose.model('Content', contentSchema);
module.exports = Content;
