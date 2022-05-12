require('dotenv').config();
const Order = require('../../models/orders');

const homePage = async (req, res) => {
  res.render('home');
};

const register = async (req, res) => {
  if (req.session.user) {
    return res.redirect('/management');
  }
  res.render('register');
};

const signIn = async (req, res) => {
  if (req.session.user) {
    return res.redirect('/management');
  }
  res.render('signIn');
};

const pricing = async (req, res) => {
  const plans = await Order.getPlans();
  res.render('pricing', { plans });
};

module.exports = {
  homePage,
  register,
  signIn,
  pricing,
};
