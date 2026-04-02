const catchAsync = require("../utils/catchAsync");
const userService = require("../services/userService");

const getAllUsers = catchAsync(async (req, res) => {
  const result = await userService.getAllUsers(req.query);

  res.status(200).json({
    success: true,
    ...result,
  });
});

const getUserById = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body, req.user);

  res.status(200).json({
    success: true,
    message: "User updated successfully.",
    data: user,
  });
});

const deactivateUser = catchAsync(async (req, res) => {
  const user = await userService.deactivateUser(req.params.id, req.user._id);

  res.status(200).json({
    success: true,
    message: "User deactivated.",
    data: user,
  });
});

module.exports = { getAllUsers, getUserById, updateUser, deactivateUser };
