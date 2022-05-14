require('dotenv').config();
const Order = require('../../models/orders');

const homePage = async (req, res) => {
  let btnString = 'Sign In';
  if (req.session.user) {
    btnString = 'Console';
  }
  res.render('home', { btnString });
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
  let btnString = 'Sign In';
  if (req.session.user) {
    btnString = 'Console';
  }
  const plans = await Order.getPlans();
  res.render('pricing', { plans, btnString });
};

module.exports = {
  homePage,
  register,
  signIn,
  pricing,
};
