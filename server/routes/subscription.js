const router = require('express').Router();
const { subscribe, verifySubscription, cancelSubscription, trackNotification } = require('../controllers/subscription');
const { wrapAsync } = require('../../utils/util');

router.route('/subscription').post(wrapAsync(subscribe));
router.route('/subscription/verify').get(wrapAsync(verifySubscription));
router.route('/subscription').delete(wrapAsync(cancelSubscription));
router.route('/subscription/tracking').get(wrapAsync(trackNotification));
module.exports = router;
