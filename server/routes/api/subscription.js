const router = require('express').Router();
const {
  subscribe,
  verifySubscription,
  cancelSubscription,
  trackNotification,
  addTagForSubscription,
  removeTagForSubscription,
} = require('../../controllers/subscriptions');
const { wrapAsync } = require('../../../utils/util');

router.route('/subscription').post(wrapAsync(subscribe));
router.route('/subscription/verify').get(wrapAsync(verifySubscription));
router.route('/subscription').delete(wrapAsync(cancelSubscription));
router.route('/subscription/tracking').get(wrapAsync(trackNotification));
router.route('/subscription/tag').post(wrapAsync(addTagForSubscription));
router.route('/subscription/tag').delete(wrapAsync(removeTagForSubscription));
module.exports = router;
