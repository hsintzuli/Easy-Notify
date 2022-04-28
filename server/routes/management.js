const router = require('express').Router();
const { apps, channels, sendNotificaton, createApp, dashboard, reports, reportNotification } = require('../controllers/management');
const { pushNotification, getNotificationsByApp, getNotificationById } = require('../controllers/notifications');
const { userAuthentication, setChannelDataToReq, wrapAsync } = require('../../utils/util');

router.route('/management/apps').get(wrapAsync(apps));
router.route('/management/channels').get(wrapAsync(channels));
router.route('/management/sendnotification').get(wrapAsync(sendNotificaton));
router.route('/management/create/app').get(wrapAsync(createApp));
router.route('/management/dashboard').get(wrapAsync(dashboard));
router.route('/management/reports/notifications').get(wrapAsync(reportNotification));
router.route('/management/reports').get(wrapAsync(reports));

router.route('/management/notifications/:scheduledType').post(userAuthentication, wrapAsync(setChannelDataToReq), wrapAsync(pushNotification));
router.route('/management/notifications').get(userAuthentication, wrapAsync(getNotificationsByApp), wrapAsync(getNotificationById));
module.exports = router;
