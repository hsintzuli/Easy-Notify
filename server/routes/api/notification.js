const router = require('express').Router();
const {
  validateNotification,
  pushNotification,
  getNotificationsByApp,
  deleteNotification,
  getNotificationById,
  checkUpdateAndDelete,
} = require('../../controllers/notifications');
const { userAuthentication, setChannelDataToReq, wrapAsync } = require('../../../utils/util');

router.use('/notifications', userAuthentication);
router.route('/notifications/:scheduledType').post(validateNotification, wrapAsync(setChannelDataToReq), wrapAsync(pushNotification));
router.route('/notifications').delete(wrapAsync(deleteNotification));
router.route('/notifications').put(wrapAsync(checkUpdateAndDelete), wrapAsync(setChannelDataToReq), wrapAsync(pushNotification));
router.route('/notifications').get(wrapAsync(getNotificationsByApp), wrapAsync(getNotificationById));

module.exports = router;
