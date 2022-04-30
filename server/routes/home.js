const router = require('express').Router();
const { homePage, signIn, register, pricing } = require('../controllers/home');
const { wrapAsync } = require('../../utils/util');

router.route('/').get(wrapAsync(homePage));
router.route('/signin').get(wrapAsync(signIn));
router.route('/register').get(wrapAsync(register));
router.route('/pricing').get(wrapAsync(pricing));

module.exports = router;
