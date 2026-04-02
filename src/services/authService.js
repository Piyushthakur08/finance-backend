const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  });
};

const registerUser = async ({ name, email, password, role }) => {
  // Check if email is already taken
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("An account with that email already exists.", 409);
  }

  const user = await User.create({ name, email, password, role });
  const token = generateToken(user._id);

  return { user, token };
};

const loginUser = async ({ email, password }) => {
  // Need to explicitly select password since it's excluded by default
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (!user.isActive) {
    throw new AppError("This account has been deactivated. Contact an admin.", 403);
  }

  const passwordMatch = await user.comparePassword(password);
  if (!passwordMatch) {
    throw new AppError("Invalid email or password.", 401);
  }

  const token = generateToken(user._id);

  return { user, token };
};

module.exports = { registerUser, loginUser };
