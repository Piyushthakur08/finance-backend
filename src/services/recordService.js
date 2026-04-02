const Record = require("../models/Record");
const AppError = require("../utils/AppError");
const { buildPagination, paginationResponse } = require("../utils/pagination");

const createRecord = async (data, userId) => {
  const record = await Record.create({
    ...data,
    createdBy: userId,
  });
  return record;
};

const getRecords = async (query) => {
  const { page, limit, skip } = buildPagination(query);

  const filter = {};

  // Filter by type (income / expense)
  if (query.type) filter.type = query.type;

  // Filter by category
  if (query.category) filter.category = query.category;

  // Filter by date range
  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = new Date(query.startDate);
    if (query.endDate) filter.date.$lte = new Date(query.endDate);
  }

  // Search in description
  if (query.search) {
    filter.description = { $regex: query.search, $options: "i" };
  }

  // Sorting — default is newest first
  let sortBy = { date: -1 };
  if (query.sortBy) {
    const direction = query.sortOrder === "asc" ? 1 : -1;
    sortBy = { [query.sortBy]: direction };
  }

  const [records, total] = await Promise.all([
    Record.find(filter)
      .populate("createdBy", "name email")
      .sort(sortBy)
      .skip(skip)
      .limit(limit),
    Record.countDocuments(filter),
  ]);

  return paginationResponse(records, total, page, limit);
};

const getRecordById = async (id) => {
  const record = await Record.findById(id).populate("createdBy", "name email");

  if (!record) {
    throw new AppError("Record not found.", 404);
  }

  return record;
};

const updateRecord = async (id, updates) => {
  // Prevent changing the creator
  delete updates.createdBy;

  const record = await Record.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).populate("createdBy", "name email");

  if (!record) {
    throw new AppError("Record not found.", 404);
  }

  return record;
};

const softDeleteRecord = async (id) => {
  const record = await Record.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );

  if (!record) {
    throw new AppError("Record not found.", 404);
  }

  return record;
};

module.exports = {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  softDeleteRecord,
};
