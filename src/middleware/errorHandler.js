const AppError = require("../utils/AppError");

/*
  Handles Mongoose-specific errors and converts them
  into a consistent response format.
*/
const handleCastError = (err) => {
  return new AppError(`Invalid value "${err.value}" for field "${err.path}"`, 400);
};

const handleDuplicateKey = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`An account with that ${field} already exists.`, 409);
};

const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new AppError(`Validation failed: ${messages.join(". ")}`, 400);
};

const errorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message };

  // Mongoose bad ObjectId
  if (err.name === "CastError") error = handleCastError(err);

  // Mongoose duplicate key (e.g. duplicate email)
  if (err.code === 11000) error = handleDuplicateKey(err);

  // Mongoose validation errors
  if (err.name === "ValidationError") error = handleValidationError(err);

  const statusCode = error.statusCode || 500;
  const message = error.isOperational
    ? error.message
    : "Something went wrong on our end.";

  // Log unexpected errors for debugging
  if (!error.isOperational) {
    console.error("Unexpected error:", err);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

module.exports = errorHandler;
