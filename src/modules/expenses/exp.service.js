const prisma = require("../../db/prisma");
const throwError = require("../../utils/errorHandling");
const {
  addCashLedgerEntry,
  updateCashLedgerEntry,
} = require("../ledger/ledger.service");

const addExpenseCategory = async (name, description) => {
  const existingName = await prisma.expenseCategory.findUnique({
    where: { name },
  });
  if (existingName) throwError("Expense Already Exists", 400);

  const expenseCategory = await prisma.expenseCategory.create({
    data: {
      name,
      description,
    },
  });
  return expenseCategory;
};

const addExpense = async (
  label = null,
  amount,
  expenseCategoryName,
  note = null,
  createdById,
) => {
  if (amount <= 0) throwError("Amount cant be less than equal to 0");
  const user = await prisma.user.findUnique({
    where: { userName: createdById },
  });
  if (!user) throwError("User not found", 400);
  const userId = user.id;
  const expenseCategory = await prisma.expenseCategory.findUnique({
    where: { name: expenseCategoryName },
  });
  if (!expenseCategory)
    throwError("Expense Category not Found. First Add this category", 400);
  const expenseCategoryId = expenseCategory.id;
  const expense = await prisma.expense.create({
    data: {
      label,
      amount,
      expenseCategoryId,
      note,
      createdById: userId,
    },
  });
  await addCashLedgerEntry({
    direction: "OUT",
    amount: amount,
    sourceType: "EXPENSE",
    sourceId: expense.id,
    note: note,
  });
  return expense;
};

const updateExpense = async (id, updatedData) => {
  const ifExpense = await prisma.expense.findUnique({ where: { id } });
  if (!ifExpense) throwError("Expense not Found", 400);
  let check = false;

  const dataToUpdate = {};
  if (updatedData.label !== undefined) dataToUpdate.label = updatedData.label;
  if (updatedData.amount !== undefined) {
    if (updatedData.amount <= 0)
      throwError("Amount cant be less than equal to 0");
    dataToUpdate.amount = updatedData.amount;
    check = true;
  }
  if (updatedData.expenseCategoryName !== undefined) {
    const existingCategory = await prisma.expenseCategory.findUnique({
      where: { name: updatedData.expenseCategoryName },
    });
    if (!existingCategory)
      throwError("Expense Category not Found. First Add this category", 400);
    const expenseCategoryId = existingCategory.id;
    dataToUpdate.expenseCategoryId = expenseCategoryId;
  }
  if (updatedData.expenseDate !== undefined) {
    const date = new Date(updatedData.expenseDate);
    dataToUpdate.expenseDate = date;
  }
  if (updatedData.createdById !== undefined) {
    const user = await prisma.user.findUnique({
      where: { userName: updatedData.createdById },
    });

    if (!user) throwError("User not found", 400);

    dataToUpdate.createdById = user.id;
  }
  if (updatedData.note !== undefined) {
    dataToUpdate.note = updatedData.note;
  }
  const updateExpense = await prisma.expense.update({
    where: {
      id,
    },
    data: dataToUpdate,
  });
  if (check) {
    await updateCashLedgerEntry({
      sourceType: "EXPENSE",
      sourceId: ifExpense.id,
      amount: updatedData.amount,
    });
  }
  return updateExpense;
};

const getAllExpensesToday = async () => {
  const currentDate = new Date();
  const startOfDay = new Date(currentDate);
  startOfDay.setHours(0, 0, 0, 0);
  const expenses = await prisma.expense.findMany({
    where: {
      expenseDate: {
        gte: startOfDay,
        lte: currentDate,
      },
    },
  });
  return expenses;
};
const getAllExpensesSumToday = async () => {
  const currentDate = new Date();
  const startOfDay = new Date(currentDate);
  startOfDay.setHours(0, 0, 0, 0);
  const expenses = await prisma.expense.aggregate({
    where: {
      expenseDate: {
        gte: startOfDay,
        lte: currentDate,
      },
    },
    _sum: {
      amount: true,
    },
  });
  return expenses;
};

const getAllExpensesSumbyDateRange = async (startDate, endDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  const expenses = await prisma.expense.aggregate({
    where: {
      expenseDate: {
        gte: start,
        lte: end,
      },
    },
    _sum: {
      amount: true,
    },
  });
  return expenses;
};
const getAllExpensesbyDateRange = async (startDate, endDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  const expenses = await prisma.expense.findMany({
    where: {
      expenseDate: {
        gte: start,
        lte: end,
      },
    },
  });
  return expenses;
};

module.exports = {
  addExpenseCategory,
  addExpense,
  updateExpense,
  getAllExpensesSumToday,
  getAllExpensesSumbyDateRange,
  getAllExpensesToday,
  getAllExpensesbyDateRange,
};
