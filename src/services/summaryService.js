const Record = require("../models/Record");

/*
  Computes high-level financial summaries using
  MongoDB's aggregation pipeline. This keeps the
  heavy lifting on the database side rather than
  pulling all records into memory.
*/

const getOverallSummary = async (query) => {
  const matchStage = { isDeleted: false };

  // Allow filtering summary by date range
  if (query.startDate || query.endDate) {
    matchStage.date = {};
    if (query.startDate) matchStage.date.$gte = new Date(query.startDate);
    if (query.endDate) matchStage.date.$lte = new Date(query.endDate);
  }

  const result = await Record.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
        },
        totalExpenses: {
          $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
        },
        recordCount: { $sum: 1 },
      },
    },
  ]);

  if (result.length === 0) {
    return {
      totalIncome: 0,
      totalExpenses: 0,
      netBalance: 0,
      recordCount: 0,
    };
  }

  const { totalIncome, totalExpenses, recordCount } = result[0];

  return {
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    netBalance: Math.round((totalIncome - totalExpenses) * 100) / 100,
    recordCount,
  };
};

const getCategoryBreakdown = async (query) => {
  const matchStage = { isDeleted: false };

  if (query.type) matchStage.type = query.type;
  if (query.startDate || query.endDate) {
    matchStage.date = {};
    if (query.startDate) matchStage.date.$gte = new Date(query.startDate);
    if (query.endDate) matchStage.date.$lte = new Date(query.endDate);
  }

  const breakdown = await Record.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { category: "$category", type: "$type" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
        avgAmount: { $avg: "$amount" },
      },
    },
    {
      $project: {
        _id: 0,
        category: "$_id.category",
        type: "$_id.type",
        total: { $round: ["$total", 2] },
        count: 1,
        avgAmount: { $round: ["$avgAmount", 2] },
      },
    },
    { $sort: { total: -1 } },
  ]);

  return breakdown;
};

const getMonthlyTrends = async (query) => {
  const matchStage = { isDeleted: false };

  // Default to last 12 months if no range specified
  if (query.startDate || query.endDate) {
    matchStage.date = {};
    if (query.startDate) matchStage.date.$gte = new Date(query.startDate);
    if (query.endDate) matchStage.date.$lte = new Date(query.endDate);
  } else {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    matchStage.date = { $gte: twelveMonthsAgo };
  }

  const trends = await Record.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          type: "$type",
        },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        type: "$_id.type",
        total: { $round: ["$total", 2] },
        count: 1,
      },
    },
    { $sort: { year: 1, month: 1 } },
  ]);

  return trends;
};

const getRecentActivity = async (limitCount = 10) => {
  const records = await Record.find({ isDeleted: false })
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .limit(limitCount);

  return records;
};

module.exports = {
  getOverallSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getRecentActivity,
};
