const catchAsync = require("../utils/catchAsync");
const authService = require("../services/authService");

const register = catchAsync(async (req, res) => {
  const { name, email, password, role } = req.body;
  const { user, token } = await authService.registerUser({ name, email, password, role });

  res.status(201).json({
    success: true,
    message: "Account created successfully.",
    data: { user, token },
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.loginUser({ email, password });

  res.status(200).json({
    success: true,
    message: "Logged in successfully.",
    data: { user, token },
  });
});

const getProfile = catchAsync(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

module.exports = { register, login, getProfile };
