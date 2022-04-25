require('dotenv').config();

const homePage = async (req, res) => {
  res.render('home');
};

const register = async (req, res) => {
  res.render('register');
};

const signIn = async (req, res) => {
  res.render('signIn');
};

module.exports = {
  homePage,
  register,
  signIn,
};
