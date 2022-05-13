const router = require('express').Router();
const {
  validateNotification,
  pushNotification,
  getNotifications,
  getNotificationById,
  checkUpdateAndDelete,
  deleteNotification,
} = require('../controllers/notifications');
const { wrapAsync, apiAuthentication } = require('../../utils/util');

router.route('/notifications/:scheduledType').post(wrapAsync(apiAuthentication), validateNotification, wrapAsync(pushNotification));
router.route('/notifications').get(wrapAsync(apiAuthentication), wrapAsync(getNotifications), wrapAsync(getNotificationById));
router.route('/notifications').put(wrapAsync(apiAuthentication), wrapAsync(checkUpdateAndDelete), validateNotification, wrapAsync(pushNotification));
router.route('/notifications').delete(wrapAsync(apiAuthentication), wrapAsync(deleteNotification));

module.exports = router;
