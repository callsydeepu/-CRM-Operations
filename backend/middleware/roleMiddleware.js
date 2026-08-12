const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: req.user ? `User role ${req.user.role} is not authorized to access this route` : 'Access denied: Authentication required'
      });
    }
    next();
  };
};

module.exports = { authorize };
