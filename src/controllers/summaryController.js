const catchAsync = require("../utils/catchAsync");
const summaryService = require("../services/summaryService");

const getOverallSummary = catchAsync(async (req, res) => {
  const summary = await summaryService.getOverallSummary(req.query);

  res.status(200).json({
    success: true,
    data: summary,
  });
});

const getCategoryBreakdown = catchAsync(async (req, res) => {
  const breakdown = await summaryService.getCategoryBreakdown(req.query);

  res.status(200).json({
    success: true,
    data: breakdown,
  });
});

const getMonthlyTrends = catchAsync(async (req, res) => {
  const trends = await summaryService.getMonthlyTrends(req.query);

  res.status(200).json({
    success: true,
    data: trends,
  });
});

const getRecentActivity = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const records = await summaryService.getRecentActivity(limit);

  res.status(200).json({
    success: true,
    data: records,
  });
});

module.exports = {
  getOverallSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getRecentActivity,
};
