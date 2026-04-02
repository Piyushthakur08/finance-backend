const catchAsync = require("../utils/catchAsync");
const recordService = require("../services/recordService");

const createRecord = catchAsync(async (req, res) => {
  const record = await recordService.createRecord(req.body, req.user._id);

  res.status(201).json({
    success: true,
    message: "Record created.",
    data: record,
  });
});

const getRecords = catchAsync(async (req, res) => {
  const result = await recordService.getRecords(req.query);

  res.status(200).json({
    success: true,
    ...result,
  });
});

const getRecordById = catchAsync(async (req, res) => {
  const record = await recordService.getRecordById(req.params.id);

  res.status(200).json({
    success: true,
    data: record,
  });
});

const updateRecord = catchAsync(async (req, res) => {
  const record = await recordService.updateRecord(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Record updated.",
    data: record,
  });
});

const deleteRecord = catchAsync(async (req, res) => {
  await recordService.softDeleteRecord(req.params.id);

  res.status(200).json({
    success: true,
    message: "Record deleted.",
  });
});

module.exports = { createRecord, getRecords, getRecordById, updateRecord, deleteRecord };
