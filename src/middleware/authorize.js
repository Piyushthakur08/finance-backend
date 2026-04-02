const { PERMISSIONS } = require("../config/constants");
const AppError = require("../utils/AppError");

/*
  Takes one or more permission strings (e.g. "record:create")
  and checks if the current user's role has that permission.
*/
const authorize = (...requiredPermissions) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    const userPermissions = PERMISSIONS[userRole] || [];

    const hasAccess = requiredPermissions.every((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasAccess) {
      return next(
        new AppError(
          `Access denied. Your role (${userRole}) does not have permission for this action.`,
          403
        )
      );
    }

    next();
  };
};

module.exports = authorize;
