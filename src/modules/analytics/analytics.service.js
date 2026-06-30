const {
  getAllExpensesSumToday,
  getAllExpensesSumMonth,
  getAllExpensesSumbyDateRange,
} = require("../expenses/exp.service");
const {
  getTodaySalesSumAnyAmount,
  getMonthlySalesSumAnyAmount,
  getValidSalesSumByDateRangeAndId,
} = require("../sales/sales.service");
const {
  getTodayPaymentSum,
  getMonthPaymentSum,
  getEmployeePaymentSumByDateRange,
} = require("../employees/emp.service");
const {
  getAllEntriesSumMonth,
  getAllEntriesSumByDateRange,
  getAllEntriesSumToday,
} = require("../ledger/ledger.service");

const calulcateTodayAnalytics = async () => {
  const expenses = await getAllExpensesSumToday();
  const totalExpenses = expenses._sum.amount;
  const sales = await getTodaySalesSumAnyAmount();
  const costAmount = sales._sum.totalCost;
  const salesAmount = sales._sum.totalAmount;
  const grossProfit = sales._sum.totalProfit;
  const payments = await getTodayPaymentSum();
  const totalPayments = payments._sum.amount;
  const netProfit = grossProfit - totalExpenses - totalPayments;
  const cash = await getAllEntriesSumToday();
  return {
    costAmount,
    salesAmount,
    grossProfit,
    totalExpenses,
    totalPayments,
    netProfit,
    cash,
  };
};
const calulcateMonthlyAnalytics = async () => {
  const expenses = await getAllExpensesSumMonth();
  const totalExpenses = expenses._sum.amount || 0;
  const sales = await getMonthlySalesSumAnyAmount();
  const costAmount = sales._sum.totalCost || 0;
  const salesAmount = sales._sum.totalAmount || 0;
  const grossProfit = sales._sum.totalProfit || 0;
  const payments = await getMonthPaymentSum();
  const totalPayments = payments._sum.amount || 0;
  const netProfit = grossProfit - totalExpenses - totalPayments || 0;
  const cash = await getAllEntriesSumMonth();
  return {
    costAmount,
    salesAmount,
    grossProfit,
    totalExpenses,
    totalPayments,
    netProfit,
    cash,
  };
};

const calulcateDateRangeAnalytics = async (startDate, endDate) => {
  const expenses = await getAllExpensesSumbyDateRange(startDate, endDate);
  const totalExpenses = expenses._sum.amount || 0;
  const sales = await getValidSalesSumByDateRangeAndId(startDate, endDate);
  const costAmount = sales._sum.totalCost || 0;
  const salesAmount = sales._sum.totalAmount || 0;
  const grossProfit = sales._sum.totalProfit || 0;
  const payments = await getEmployeePaymentSumByDateRange(startDate, endDate);
  const totalPayments = payments._sum.amount || 0;
  const netProfit = grossProfit - totalExpenses - totalPayments || 0;
  const cash = await getAllEntriesSumByDateRange();
  return {
    costAmount,
    salesAmount,
    grossProfit,
    totalExpenses,
    totalPayments,
    netProfit,
    cash,
  };
};

module.exports = {
  calulcateTodayAnalytics,
  calulcateMonthlyAnalytics,
  calulcateDateRangeAnalytics
};
