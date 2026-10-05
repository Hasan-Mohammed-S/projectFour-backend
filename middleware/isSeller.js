const isSeller = (req, res, next) => {

  if (req.user && (req.user.role === 'seller' || req.user.role === 'admin')) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Seller rights required.' });
  
};

module.exports = isSeller;