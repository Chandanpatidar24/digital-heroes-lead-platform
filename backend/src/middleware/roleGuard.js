const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Access restricted to Admin role only',
    });
  }
  next();
};

const requireMemberOrAdmin = (req, res, next) => {
  if (!req.user || !['ADMIN', 'MEMBER'].includes(req.user.role)) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Insufficient privileges',
    });
  }
  next();
};

module.exports = {
  requireAdmin,
  requireMemberOrAdmin,
};
