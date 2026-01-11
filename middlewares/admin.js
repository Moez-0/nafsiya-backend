const ErrorResponse = require('../utils/errorResponse');

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user.role.includes(roles)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
