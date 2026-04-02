const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

/*
  Checks the Authorization header for a valid Bearer token.
  If valid, attaches the user object to req.user.
*/
const authenticate = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Authentication required. Please provide a valid token.", 401);
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new AppError("Token has expired. Please log in again.", 401);
    }
    throw new AppError("Invalid token.", 401);
  }

  // Make sure the user still exists and is active
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError("The user associated with this token no longer exists.", 401);
  }

  if (!user.isActive) {
    throw new AppError("This account has been deactivated. Contact an admin.", 403);
  }

  req.user = user;
  next();
});

module.exports = authenticate;
