// reference: https://thecodebarbarian.com/80-20-guide-to-express-error-handling
const wrapAsync = (fn) => {
  return function (req, res, next) {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    fn(req, res, next).catch(next);
  };
};

const userAuthentication = async function (req, res, next) {
  if (!req.session.user) {
    res.status(403).send({ error: 'Forbidden' });
    return;
  }
  next();
};

const apiAuthentication = () => {
  return async function (req, res, next) {
    let accessToken = req.get('Authorization');
    if (!accessToken) {
      res.status(401).send({ error: 'Unauthorized' });
      return;
    }

    accessToken = accessToken.replace('Bearer ', '');
    if (accessToken == 'null') {
      res.status(401).send({ error: 'Unauthorized' });
      return;
    }
  };
};

module.exports = {
  wrapAsync,
  userAuthentication,
};
