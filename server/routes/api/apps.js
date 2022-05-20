const router = require('express').Router();
const {
  validateApp,
  createApp,
  getApps,
  archiveApp,
  validateChannel,
  createChannel,
  deleteChannel,
  rotateChannelKey,
  deleteChannelKey,
} = require('../../controllers/apps');
const { userAuthentication, wrapAsync } = require('../../../utils/util');

router.use('/apps', userAuthentication);
router.route('/apps/channels').post(validateChannel, wrapAsync(createChannel));
router.route('/apps/channels').delete(wrapAsync(deleteChannel));
router.route('/apps/channels/channelkey').put(wrapAsync(rotateChannelKey));
router.route('/apps/channels/channelkey').delete(wrapAsync(deleteChannelKey));
router.route('/apps').post(validateApp, wrapAsync(createApp));
router.route('/apps').get(wrapAsync(getApps));
router.route('/apps').delete(wrapAsync(archiveApp));

module.exports = router;
