const router = require('express').Router();
const { validateUser, signUp, signIn, createOrder, getNewSubscribers } = require('../../controllers/users');
const { userAuthentication, wrapAsync } = require('../../../utils/util');

router.route('/user/signup').post(validateUser, wrapAsync(signUp));
router.route('/user/signin').post(wrapAsync(signIn));
router.route('/user/billing').post(userAuthentication, wrapAsync(createOrder));
router.route('/user/subscriptions').post(userAuthentication, wrapAsync(getNewSubscribers));

module.exports = router;
