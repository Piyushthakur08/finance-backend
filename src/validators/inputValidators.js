const { RECORD_TYPES, CATEGORIES, ROLES } = require("../config/constants");
const AppError = require("../utils/AppError");

/*
  Lightweight validation functions that run before
  the request reaches the controller. We keep these
  separate from Mongoose schema validation so we
  can return clear, specific error messages early.
*/

const validateRecordInput = (req, res, next) => {
  const { amount, type, category, date } = req.body;
  const errors = [];

  if (amount === undefined || amount === null) {
    errors.push("Amount is required");
  } else if (typeof amount !== "number" || amount <= 0) {
    errors.push("Amount must be a positive number");
  }

  if (!type) {
    errors.push("Type is required");
  } else if (!Object.values(RECORD_TYPES).includes(type)) {
    errors.push("Type must be either 'income' or 'expense'");
  }

  if (!category) {
    errors.push("Category is required");
  } else if (!CATEGORIES.includes(category)) {
    errors.push(`Category must be one of: ${CATEGORIES.join(", ")}`);
  }

  if (!date) {
    errors.push("Date is required");
  } else {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      errors.push("Date must be a valid date string (e.g. 2024-03-15)");
    } else if (parsed > new Date()) {
      errors.push("Date cannot be in the future");
    }
  }

  if (errors.length > 0) {
    return next(new AppError(errors.join(". "), 400));
  }

  next();
};

const validateUserInput = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push("Name is required and must be at least 2 characters");
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push("A valid email address is required");
  }

  if (!password || password.length < 6) {
    errors.push("Password is required and must be at least 6 characters");
  }

  if (role && !Object.values(ROLES).includes(role)) {
    errors.push(`Role must be one of: ${Object.values(ROLES).join(", ")}`);
  }

  if (errors.length > 0) {
    return next(new AppError(errors.join(". "), 400));
  }

  next();
};

const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) errors.push("Email is required");
  if (!password) errors.push("Password is required");

  if (errors.length > 0) {
    return next(new AppError(errors.join(". "), 400));
  }

  next();
};

module.exports = { validateRecordInput, validateUserInput, validateLoginInput };
