const router = require('express').Router();
const { apps, channels, sendNotificaton, createApp, dashboard, reports, reportNotification } = require('../../controllers/pages/management');
const { wrapAsync } = require('../../../utils/util');

router.route('/management/apps').get(wrapAsync(apps));
router.route('/management/channels').get(wrapAsync(channels));
router.route('/management/sendnotification').get(wrapAsync(sendNotificaton));
router.route('/management/create/app').get(wrapAsync(createApp));
router.route('/management/dashboard').get(wrapAsync(dashboard));
router.route('/management/reports/notifications').get(wrapAsync(reportNotification));
router.route('/management/reports').get(wrapAsync(reports));
module.exports = router;
