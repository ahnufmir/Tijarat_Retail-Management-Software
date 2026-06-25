const asynHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/sendResponse");
const { isValidDateRange, isValidDate } = require("../../utils/dateValidation");
const {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  deactivateEmployee,
  updateEmployee,
  createCommission,
  updateCommissionRule,
  getCommissionRules,
  calculateCommission,
  createEmployeePayment,
  getAllEmployeePayments,
  getEmployeePayments,
  getEmployeePaymentsByDateRange,
} = require("../employees/emp.service");

const createEmployeeHandler = asynHandler(async (req, res) => {
  const { userName, name, phone, wageType, wageAmount } = req.body;
  if (
    !userName ||
    userName.trim() === "" ||
    !name ||
    name.trim() === "" ||
    !wageType ||
    wageType.trim() === "" ||
    wageAmount == null
  )
    return sendResponse(res, 400, false, "Invalid Field(s)");
  const employee = await createEmployee({
    userName,
    name,
    phone,
    wageType,
    wageAmount,
  });
  return sendResponse(
    res,
    201,
    true,
    "Employee Created Successfully",
    employee,
  );
});

const getAllEmployeesHandler = asynHandler(async (req, res) => {
  const employees = await getAllEmployees();
  return sendResponse(
    res,
    200,
    true,
    "Employees Fetched Successfully",
    employees,
  );
});

const getEmployeeByIdHandler = asynHandler(async (req, res) => {
  const { name } = req.query;
  if (!name || name.trim() === "")
    return sendResponse(res, 400, false, "Invalid Name");
  const employee = await getEmployeeById(name);
  return sendResponse(
    res,
    200,
    true,
    "Employee Fetched Successfully",
    employee,
  );
});

const deactivateEmployeeHandler = asynHandler(async (req, res) => {
  const { name } = req.query;
  if (!name || name.trim() === "")
    return sendResponse(res, 400, false, "Invalid Name");
  const employee = await deactivateEmployee(name);
  return sendResponse(
    res,
    200,
    true,
    "Employee Deleted Successfully",
    employee,
  );
});

const updateEmployeeHandler = asynHandler(async (req, res) => {
  const { name } = req.query;
  const { phone, wageType, wageAmount } = req.body;
  if (
    !name ||
    name.trim() === "" ||
    !wageType ||
    wageType.trim() === "" ||
    wageAmount == null
  )
    return sendResponse(res, 400, false, "Invalid Field(s)");
  const employee = await updateEmployee(name, { phone, wageType, wageAmount });
  return sendResponse(
    res,
    200,
    true,
    "Employee Fetched Successfully",
    employee,
  );
});

const createCommissionHandler = asynHandler(async (req, res) => {
  const { name } = req.query;
  const { commissionType, commissionValue, commissionPeriod } = req.body;
  if (
    !commissionPeriod ||
    commissionPeriod.trim() === "" ||
    !commissionType ||
    commissionType.trim() === "" ||
    commissionValue == null
  )
    return sendResponse(res, 400, false, "Invalid Field(s)");
  const employee = await createCommission(
    name,
    commissionType,
    commissionValue,
    commissionPeriod,
  );
  return sendResponse(
    res,
    201,
    true,
    "Employee Commission Created Successfully",
    employee,
  );
});

const updateCommissionRuleHandler = asynHandler(async (req, res) => {
  const { name } = req.query;
  const { commissionType, commissionValue, commissionPeriod } = req.body;
  if (
    !commissionPeriod ||
    commissionPeriod.trim() === "" ||
    !commissionType ||
    commissionType.trim() === "" ||
    commissionValue == null
  )
    return sendResponse(res, 400, false, "Invalid Field(s)");
  const employee = await updateCommissionRule(name, {
    commissionType,
    commissionValue,
    commissionPeriod,
  });
  return sendResponse(
    res,
    200,
    true,
    "Employee Commission Created Successfully",
    employee,
  );
});

const getCommissionRulesHandler = asynHandler(async (req, res) => {
  const { name } = req.query;
  if (!name || name.trim() === "")
    return sendResponse(res, 400, false, "Invalid Name");
  const employee = await getCommissionRules(name);
  return sendResponse(
    res,
    200,
    true,
    "Employee Commission Rules Fetched Successfully",
    employee,
  );
});

const calculateCommissionHandler = asynHandler(async (req, res) => {
  const { name } = req.query;
  if (!name || name.trim() === "")
    return sendResponse(res, 400, false, "Invalid Name");
  const { startDate, endDate } = req.query;
  if (!isValidDateRange(startDate, endDate)) {
    return sendResponse(res, 400, false, "Invalid Date Range");
  }
  const commission = await calculateCommission(name, startDate, endDate);
  return sendResponse(
    res,
    200,
    true,
    "Commission Fetched Successfully",
    commission,
  );
});

const createEmployeePaymentHandler = asynHandler(async (req, res) => {
  const {
    empName,
    paymentType,
    amount,
    periodStart,
    periodEnd,
    note,
    createdByName,
  } = req.body;
  if (
    !empName ||
    empName.trim() === "" ||
    !paymentType ||
    paymentType.trim() === "" ||
    amount == null ||
    !createdByName ||
    createdByName.trim() === ""
  )
    return sendResponse(res, 400, false, "Invalid Field(s)");

  if (periodEnd !== null) {
    if (!isValidDateRange(periodStart, periodEnd))
      return sendResponse(res, 400, false, "Invalid Date Range");
  } else {
    if (!isValidDate(periodStart))
      return sendResponse(res, 400, false, "Invalid Date Range");
  }

  const payment = await createEmployeePayment(
    empName,
    paymentType,
    amount,
    periodStart,
    periodEnd,
    note,
    createdByName,
  );
  return sendResponse(res,201,true,"Employee Payment Created",payment);
});

const getEmployeePaymentsHandler = asynHandler(async (req, res) => {
  const { name } = req.query;
  if (!name || name.trim() === "")
    return sendResponse(res, 400, false, "Invalid Name");
  const employee = await getEmployeePayments(name);
  return sendResponse(
    res,
    200,
    true,
    "Employee Payments Fetched Successfully",
    employee,
  );
});

const getEmployeePaymentsByDateRangeHandler = asynHandler(async (req, res) => {
  const { name } = req.query;
  if (!name || name.trim() === "")
    return sendResponse(res, 400, false, "Invalid Name");
  const { startDate, endDate } = req.query;
  if (!isValidDateRange(startDate, endDate)) {
    return sendResponse(res, 400, false, "Invalid Date Range");
  }
  const commission = await getEmployeePaymentsByDateRange(
    name,
    startDate,
    endDate,
  );
  return sendResponse(
    res,
    200,
    true,
    "Payments Fetched Successfully",
    commission,
  );
});
const getAllEmployeePaymentsHandler = asynHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!isValidDateRange(startDate, endDate)) {
    return sendResponse(res, 400, false, "Invalid Date Range");
  }
  const commission = await getAllEmployeePayments(startDate, endDate);
  return sendResponse(
    res,
    200,
    true,
    "Payments Fetched Successfully",
    commission,
  );
});

module.exports = {
  createEmployeeHandler,
  getAllEmployeesHandler,
  getEmployeeByIdHandler,
  deactivateEmployeeHandler,
  updateEmployeeHandler,
  createCommissionHandler,
  updateCommissionRuleHandler,
  getCommissionRulesHandler,
  calculateCommissionHandler,
  createEmployeePaymentHandler,
  getAllEmployeePaymentsHandler,
  getEmployeePaymentsHandler,
  getEmployeePaymentsByDateRangeHandler,
};
