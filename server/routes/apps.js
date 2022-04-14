const router = require('express').Router();
const { createApp, getApps, createChannel, deleteChannel, rotateChannelKey } = require('../controllers/apps');
const { userAuthentication, wrapAsync } = require('../../utils/util');

router.use('/apps', userAuthentication);
router.route('/apps/channels').post(wrapAsync(createChannel));
router.route('/apps/channels').delete(wrapAsync(deleteChannel));
router.route('/apps/channels').put(wrapAsync(rotateChannelKey));
router.route('/apps').post(wrapAsync(createApp));
router.route('/apps').get(wrapAsync(getApps));

module.exports = router;
