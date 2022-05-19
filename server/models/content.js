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

const createContent = async (title, body, config, icon) => {
  try {
    // Save notification content to Mongo DB and use _id of Mongo as notification id
    const content = new Content({
      title: title,
      body: body,
      config: config,
      icon: icon || channel.icon, // use channel icon as default icon
    });
    const result = await content.save();
    return result._id.toString();
  } catch (error) {
    console.error('[createContent] error', createContent);
    return -1;
  }
};

const updateVapidDetail = async (notificationId, email, publiKey, privateKey) => {
  console.log(notificationId);
  notificationId = await mongoose.Types.ObjectId(notificationId);
  const vapidDetail = {
    subject: `mailto:${email}`,
    publicKey: publiKey,
    privateKey: privateKey,
  };
  const result = await Content.findOneAndUpdate({ _id: notificationId }, { vapid_detail: vapidDetail });
  return result;
};

const getContentById = async (notificationId) => {
  notificationId = mongoose.Types.ObjectId(notificationId);
  const content = await Content.findById(notificationId, '-_id -__v -vapid_detail');
  delete content._id;
  return content;
};

const getContents = async (notificationIds) => {
  notificationIds = notificationIds.map((id) => mongoose.Types.ObjectId(id));
  let contents = await Content.find({ _id: { $in: notificationIds } }, '-__v -vapid_detail');
  contents = contents.reduce((prev, curr) => {
    let { _id, ...content } = curr._doc;
    prev[_id] = content;
    return prev;
  }, {});
  return contents;
};

const deleteContent = async (notificationId) => {
  notificationId = mongoose.Types.ObjectId(notificationId);
  const result = await Content.deleteOne({ _id: notificationId });
  return result;
};
// module.exports = Content;
module.exports = {
  createContent,
  updateVapidDetail,
  getContentById,
  deleteContent,
  getContents,
};
