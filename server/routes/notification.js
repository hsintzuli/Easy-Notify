const router = require('express').Router();
const { pushNotification, getNotification, updateNotification, deleteNotification } = require('../controllers/notification');
const { wrapAsync, apiAuthentication } = require('../../utils/util');

router.use('/notifications', wrapAsync(apiAuthentication));
router.route('/notifications/:scheduledType').post(wrapAsync(pushNotification));
router.route('/notifications').get(wrapAsync(getNotification));
router.route('/notifications').put(wrapAsync(updateNotification));
router.route('/notifications').delete(wrapAsync(deleteNotification));

module.exports = router;
