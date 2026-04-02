const User = require("../models/User");
const AppError = require("../utils/AppError");
const { buildPagination, paginationResponse } = require("../utils/pagination");

const getAllUsers = async (query) => {
  const { page, limit, skip } = buildPagination(query);

  // Optional filters
  const filter = {};
  if (query.role) filter.role = query.role;
  if (query.isActive !== undefined) filter.isActive = query.isActive === "true";

  // Search by name or email
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { email: { $regex: query.search, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return paginationResponse(users, total, page, limit);
};

const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError("User not found.", 404);
  }
  return user;
};

const updateUser = async (id, updates, requestingUser) => {
  // Prevent non-admins from changing roles
  if (updates.role && requestingUser.role !== "admin") {
    throw new AppError("Only admins can change user roles.", 403);
  }

  // Don't allow password updates through this endpoint
  delete updates.password;

  const user = await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  return user;
};

const deactivateUser = async (id, requestingUserId) => {
  if (id === requestingUserId.toString()) {
    throw new AppError("You cannot deactivate your own account.", 400);
  }

  const user = await User.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  return user;
};

module.exports = { getAllUsers, getUserById, updateUser, deactivateUser };
