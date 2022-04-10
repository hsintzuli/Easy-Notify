const router = require('express').Router();
// const { pushRealtime, pushScheduled } = require('../controllers/push');
const { pushNotification } = require('../controllers/push');
const { wrapAsync } = require('../../utils/util');

// router.route('/push/realtime').post(wrapAsync(pushRealtime));
router.route('/push/:scheduledType').post(wrapAsync(pushNotification));

module.exports = router;
