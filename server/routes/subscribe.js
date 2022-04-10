const router = require('express').Router();
const { subscribe } = require('../controllers/subscribe');
const { wrapAsync } = require('../../utils/util');

router.route('/subscribe').post(wrapAsync(subscribe));

module.exports = router;
