const router = require('express').Router();
const { genKey } = require('../controllers/user');
const { wrapAsync } = require('../../utils/util');

router.route('/keys').get(wrapAsync(genKey));

module.exports = router;
