const router = require('express').Router();
const { genKey, subscribe } = require('../controllers/client');
const { wrapAsync } = require('../../utils/util');

router.route('/keys').get(wrapAsync(genKey));
router.route('/push').post(wrapAsync(subscribe));

module.exports = router;
