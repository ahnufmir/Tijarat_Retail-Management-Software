const prisma = require("../../db/prisma");
const throwError = require("../../utils/errorHandling");
const {getAllExpensesSumToday} = require("../expenses/exp.service");
const {getTodaySalesSumAnyAmount} = require("../sales/sales.service")
const {getTodayPaymentSum} = require("../employees/emp.service")

const addCashLedgerEntry = async (
  { direction, amount, sourceType, sourceId, note = null },
  tx = null,
) => {
  const allowedDirection = ["IN", "OUT"];
  const allowedSourceType = [
    "EXPENSE",
    "SALE",
    "CANCEL_SALE",
    "RETURN_SALE",
    "EMPLOYEE_PAYMENT",
    "STOCK_ADDED",
    "MANUAL_ADJUSTMENT",
  ];
  if (!allowedDirection.includes(direction))
    throwError("Direction can be either 'IN' or 'OUT'", 400);
  if (!allowedSourceType.includes(sourceType))
    throwError("Source Type is not Valid", 400);
  if (sourceId == null) throwError("Source Id is undefined", 400);
  const client = tx || prisma;
  const entry = await client.cashLedger.create({
    data: {
      direction,
      amount,
      sourceType,
      sourceId,
      note,
    },
  });
  return entry;
};

const updateCashLedgerEntry = async ({sourceType, sourceId, amount}) => {
  const checkEntry = await prisma.cashLedger.findUnique({
    where: {
      sourceType_sourceId: {
        sourceType,
        sourceId,
      },
    },
  });
  if (!checkEntry) throwError("Entry not Found", 400);
  const updateEntry = await prisma.cashLedger.update({
    where:{
        id:checkEntry.id
    },
    data:{
        amount
    }
  })
  return updateEntry;
};

const calulcateTodayAnalytics = async() => {
  const expenses = await getAllExpensesSumToday();
  const totalExpenses = expenses._sum.amount;
  const sales = await getTodaySalesSumAnyAmount();
  const costAmount = sales._sum.totalCost;
  const salesAmount = sales._sum.totalAmount;
  const grossProfit = sales._sum.totalProfit;
  const payments = await getTodayPaymentSum();
  const totalPayments = payments._sum.amount;
  const netProfit = grossProfit - totalExpenses - totalPayments;
  return {
    costAmount,
    salesAmount,
    grossProfit,
    totalExpenses,
    totalPayments,
    netProfit
  };
}

module.exports = {
  addCashLedgerEntry,
  updateCashLedgerEntry,
  calulcateTodayAnalytics
};
