const router = require('express').Router();
const { homePage, signIn, register } = require('../controllers/home');
const { wrapAsync } = require('../../utils/util');

router.route('/').get(wrapAsync(homePage));
router.route('/signin').get(wrapAsync(signIn));
router.route('/register').get(wrapAsync(register));

module.exports = router;
