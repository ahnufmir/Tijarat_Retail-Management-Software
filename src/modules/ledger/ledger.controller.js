const asyncHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/sendResponse");
const throwError = require("../../utils/errorHandling");
const { isValidDateRange } = require("../../utils/dateValidation");

const {
  getAllInEntriesToday,
  getAllOutEntriesToday,
  getAllEntriesToday,
  getAllInEntriesSumToday,
  getAllOutEntriesSumToday,
  getAllEntriesSumToday,
  getAllInEntriesMonth,
  getAllOutEntriesMonth,
  getAllEntriesMonth,
  getAllInEntriesSumMonth,
  getAllOutEntriesSumMonth,
  getAllEntriesSumMonth,
  getAllEntriesByDateRange,
  getAllInEntriesByDateRange,
  getAllOutEntriesByDateRange,
  getAllEntriesSumByDateRange,
  getAllInEntriesSumByDateRange,
  getAllOutEntriesSumByDateRange,
} = require("./ledger.service");

// ======================= TODAY =======================

const getAllEntriesTodayHandler = asyncHandler(async (req, res) => {
  const entries = await getAllEntriesToday();

  sendResponse(res, 200, true, "Entries fetched successfully", entries);
});

const getAllInEntriesTodayHandler = asyncHandler(async (req, res) => {
  const entries = await getAllInEntriesToday();

  sendResponse(res, 200, true, "IN entries fetched successfully", entries);
});

const getAllOutEntriesTodayHandler = asyncHandler(async (req, res) => {
  const entries = await getAllOutEntriesToday();

  sendResponse(res, 200, true, "OUT entries fetched successfully", entries);
});

const getAllEntriesSumTodayHandler = asyncHandler(async (req, res) => {
  const total = await getAllEntriesSumToday();

  sendResponse(res, 200, true, "Entries total fetched successfully", total);
});

const getAllInEntriesSumTodayHandler = asyncHandler(async (req, res) => {
  const total = await getAllInEntriesSumToday();

  sendResponse(res, 200, true, "IN entries total fetched successfully", total);
});

const getAllOutEntriesSumTodayHandler = asyncHandler(async (req, res) => {
  const total = await getAllOutEntriesSumToday();

  sendResponse(res, 200, true, "OUT entries total fetched successfully", total);
});

// ======================= MONTH =======================

const getAllEntriesMonthHandler = asyncHandler(async (req, res) => {
  const entries = await getAllEntriesMonth();

  sendResponse(res, 200, true, "Monthly entries fetched successfully", entries);
});

const getAllInEntriesMonthHandler = asyncHandler(async (req, res) => {
  const entries = await getAllInEntriesMonth();

  sendResponse(res, 200, true, "Monthly IN entries fetched successfully", entries);
});

const getAllOutEntriesMonthHandler = asyncHandler(async (req, res) => {
  const entries = await getAllOutEntriesMonth();

  sendResponse(res, 200, true, "Monthly OUT entries fetched successfully", entries);
});

const getAllEntriesSumMonthHandler = asyncHandler(async (req, res) => {
  const total = await getAllEntriesSumMonth();

  sendResponse(res, 200, true, "Monthly entries total fetched successfully", total);
});

const getAllInEntriesSumMonthHandler = asyncHandler(async (req, res) => {
  const total = await getAllInEntriesSumMonth();

  sendResponse(res, 200, true, "Monthly IN entries total fetched successfully", total);
});

const getAllOutEntriesSumMonthHandler = asyncHandler(async (req, res) => {
  const total = await getAllOutEntriesSumMonth();

  sendResponse(res, 200, true, "Monthly OUT entries total fetched successfully", total);
});

// ======================= DATE RANGE =======================

const getAllEntriesByDateRangeHandler = asyncHandler(async (req, res) => {
  let { startDate, endDate } = req.query;

  startDate = startDate?.trim();
  endDate = endDate?.trim();

  if (!startDate || !endDate)
    throwError("Start Date and End Date are required", 400);

  if (!isValidDateRange(startDate, endDate))
    throwError("Invalid Date Range", 400);

  const entries = await getAllEntriesByDateRange(startDate, endDate);

  sendResponse(res, 200, true, "Entries fetched successfully", entries);
});

const getAllInEntriesByDateRangeHandler = asyncHandler(async (req, res) => {
  let { startDate, endDate } = req.query;

  startDate = startDate?.trim();
  endDate = endDate?.trim();

  if (!startDate || !endDate)
    throwError("Start Date and End Date are required", 400);

  if (!isValidDateRange(startDate, endDate))
    throwError("Invalid Date Range", 400);

  const entries = await getAllInEntriesByDateRange(startDate, endDate);

  sendResponse(res, 200, true, "IN entries fetched successfully", entries);
});

const getAllOutEntriesByDateRangeHandler = asyncHandler(async (req, res) => {
  let { startDate, endDate } = req.query;

  startDate = startDate?.trim();
  endDate = endDate?.trim();

  if (!startDate || !endDate)
    throwError("Start Date and End Date are required", 400);

  if (!isValidDateRange(startDate, endDate))
    throwError("Invalid Date Range", 400);

  const entries = await getAllOutEntriesByDateRange(startDate, endDate);

  sendResponse(res, 200, true, "OUT entries fetched successfully", entries);
});

const getAllEntriesSumByDateRangeHandler = asyncHandler(async (req, res) => {
  let { startDate, endDate } = req.query;

  startDate = startDate?.trim();
  endDate = endDate?.trim();

  if (!startDate || !endDate)
    throwError("Start Date and End Date are required", 400);

  if (!isValidDateRange(startDate, endDate))
    throwError("Invalid Date Range", 400);

  const total = await getAllEntriesSumByDateRange(startDate, endDate);

  sendResponse(res, 200, true, "Entries total fetched successfully", total);
});

const getAllInEntriesSumByDateRangeHandler = asyncHandler(async (req, res) => {
  let { startDate, endDate } = req.query;

  startDate = startDate?.trim();
  endDate = endDate?.trim();

  if (!startDate || !endDate)
    throwError("Start Date and End Date are required", 400);

  if (!isValidDateRange(startDate, endDate))
    throwError("Invalid Date Range", 400);

  const total = await getAllInEntriesSumByDateRange(startDate, endDate);

  sendResponse(res, 200, true, "IN entries total fetched successfully", total);
});

const getAllOutEntriesSumByDateRangeHandler = asyncHandler(async (req, res) => {
  let { startDate, endDate } = req.query;

  startDate = startDate?.trim();
  endDate = endDate?.trim();

  if (!startDate || !endDate)
    throwError("Start Date and End Date are required", 400);

  if (!isValidDateRange(startDate, endDate))
    throwError("Invalid Date Range", 400);

  const total = await getAllOutEntriesSumByDateRange(startDate, endDate);

  sendResponse(res, 200, true, "OUT entries total fetched successfully", total);
});

module.exports = {
  getAllEntriesTodayHandler,
  getAllInEntriesTodayHandler,
  getAllOutEntriesTodayHandler,
  getAllEntriesSumTodayHandler,
  getAllInEntriesSumTodayHandler,
  getAllOutEntriesSumTodayHandler,

  getAllEntriesMonthHandler,
  getAllInEntriesMonthHandler,
  getAllOutEntriesMonthHandler,
  getAllEntriesSumMonthHandler,
  getAllInEntriesSumMonthHandler,
  getAllOutEntriesSumMonthHandler,

  getAllEntriesByDateRangeHandler,
  getAllInEntriesByDateRangeHandler,
  getAllOutEntriesByDateRangeHandler,
  getAllEntriesSumByDateRangeHandler,
  getAllInEntriesSumByDateRangeHandler,
  getAllOutEntriesSumByDateRangeHandler,
};