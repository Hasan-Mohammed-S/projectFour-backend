const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = async (req, res, next) => {
  const header = req.headers.authorization || '';

  if (!/^Bearer \S+$/.test(header)) {
    return res.status(401).json({ error: 'Please sign in to continue.' });
  }

  let payload;

  try {
    payload = jwt.verify(
      header.slice(7), 
      process.env.JWT_SECRET, 
      { algorithms: ['HS256'], maxAge: '8h' }
    );
  } catch {
    return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
  }

  try {
    const user = await User.findById(payload._id);

    if (!user || user.isActive === false) {
      return res.status(401).json({ error: 'This account is no longer active.' });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};