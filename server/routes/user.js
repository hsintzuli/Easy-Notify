const router = require('express').Router();
const { signUp, signIn, createOrder } = require('../controllers/user');
const { wrapAsync } = require('../../utils/util');

router.route('/user/signup').post(wrapAsync(signUp));
router.route('/user/signin').post(wrapAsync(signIn));
router.route('/user/billing').post(wrapAsync(createOrder));

module.exports = router;
