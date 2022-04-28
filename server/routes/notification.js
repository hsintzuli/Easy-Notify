const router = require('express').Router();
const {
  pushNotification,
  getNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
  getNotificationsByApp,
} = require('../controllers/notifications');
const { wrapAsync, apiAuthentication } = require('../../utils/util');

router.route('/notifications/:scheduledType').post(wrapAsync(apiAuthentication), wrapAsync(pushNotification));
router.route('/notifications').get(wrapAsync(apiAuthentication), wrapAsync(getNotifications), wrapAsync(getNotificationById));
router.route('/notifications').put(wrapAsync(apiAuthentication), wrapAsync(updateNotification));
router.route('/notifications').delete(wrapAsync(apiAuthentication), wrapAsync(deleteNotification));

module.exports = router;
