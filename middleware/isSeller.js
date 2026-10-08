module.exports = (req, res, next) => {
  if (req.user?.role === 'seller') {
    return next();
  }
  
  res.status(403).json({ error: 'A seller account is required.' });
};