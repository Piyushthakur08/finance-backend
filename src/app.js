require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/database");
const errorHandler = require("./middleware/errorHandler");
const AppError = require("./utils/AppError");

// Route imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const recordRoutes = require("./routes/recordRoutes");
const summaryRoutes = require("./routes/summaryRoutes");

const app = express();

// ─── Security & parsing ────────────────────────────────
app.use(helmet());
app.use(express.json({ limit: "10kb" })); // limit body size to prevent abuse

// ─── Logging ───────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// ─── Rate limiting ─────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: "Too many requests. Please try again later.",
  },
});
app.use("/api", limiter);

// ─── Routes ────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/summary", summaryRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running.",
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 handler ───────────────────────────────────────
app.all("*", (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found.`, 404));
});

// ─── Global error handler ──────────────────────────────
app.use(errorHandler);

// ─── Start ─────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
};

// Only start listening if this file is run directly (not imported for testing)
if (require.main === module) {
  startServer();
}

module.exports = app;
