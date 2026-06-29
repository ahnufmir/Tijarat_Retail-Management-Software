const asyncHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/sendResponse");
const { isValidDateRange } = require("../../utils/dateValidation");

const {
  addExpenseCategory,
  addExpense,
  updateExpense,
  getAllExpensesSumToday,
  getAllExpensesSumbyDateRange,
  getAllExpensesToday,
  getAllExpensesbyDateRange,
} = require("../expenses/exp.service");

const addExpenseCategoryHandler = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || name.trim() === "")
    return sendResponse(res, 400, false, "Invalid Category Name");

  const category = await addExpenseCategory(name, description);

  return sendResponse(
    res,
    200,
    true,
    "Expense Category Created Successfully",
    category
  );
});

const addExpenseHandler = asyncHandler(async (req, res) => {
  const {
    label,
    amount,
    expenseCategoryName,
    note,
    createdById,
  } = req.body;

  if (
    amount == null ||
    !expenseCategoryName ||
    expenseCategoryName.trim() === "" ||
    !createdById ||
    createdById.trim() === ""
  )
    return sendResponse(res, 400, false, "Invalid Field(s)");

  const expense = await addExpense(
    label,
    amount,
    expenseCategoryName,
    note,
    createdById
  );

  return sendResponse(
    res,
    200,
    true,
    "Expense Added Successfully",
    expense
  );
});

const updateExpenseHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) return sendResponse(res, 400, false, "Invalid Expense Id");

  const expense = await updateExpense(Number(id), req.body);

  return sendResponse(
    res,
    200,
    true,
    "Expense Updated Successfully",
    expense
  );
});

const getAllExpensesTodayHandler = asyncHandler(async (req, res) => {
  const expenses = await getAllExpensesToday();

  return sendResponse(
    res,
    200,
    true,
    "Today's Expenses Fetched Successfully",
    expenses
  );
});

const getAllExpensesSumTodayHandler = asyncHandler(async (req, res) => {
  const expenses = await getAllExpensesSumToday();

  return sendResponse(
    res,
    200,
    true,
    "Today's Expense Total Fetched Successfully",
    expenses
  );
});

const getAllExpensesByDateRangeHandler = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!isValidDateRange(startDate, endDate))
    return sendResponse(res, 400, false, "Invalid Date Range");

  const expenses = await getAllExpensesbyDateRange(startDate, endDate);

  return sendResponse(
    res,
    200,
    true,
    "Expenses Fetched Successfully",
    expenses
  );
});

const getAllExpensesSumByDateRangeHandler = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!isValidDateRange(startDate, endDate))
    return sendResponse(res, 400, false, "Invalid Date Range");

  const expenses = await getAllExpensesSumbyDateRange(startDate, endDate);

  return sendResponse(
    res,
    200,
    true,
    "Expense Total Fetched Successfully",
    expenses
  );
});

module.exports = {
  addExpenseCategoryHandler,
  addExpenseHandler,
  updateExpenseHandler,
  getAllExpensesTodayHandler,
  getAllExpensesSumTodayHandler,
  getAllExpensesByDateRangeHandler,
  getAllExpensesSumByDateRangeHandler,
};