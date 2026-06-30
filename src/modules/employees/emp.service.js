const prisma = require("../../db/prisma");
const throwError = require("../../utils/errorHandling");
const {
  getValidSalesByDateRange,
  getValidSalesByDateRangeAndId,
} = require("../sales/sales.service");
const { addCashLedgerEntry } = require("../ledger/ledger.service");

const createEmployee = async ({
  userName,
  name,
  phone = null,
  wageType,
  wageAmount,
}) => {
  const existingEmployee = await prisma.employee.findUnique({
    where: {
      name,
    },
  });
  if (existingEmployee) throwError("Employee is already Registered", 400);
  const user = await prisma.user.findUnique({
    where: {
      userName,
    },
  });
  if (!user)
    throwError(
      "Employee is not Registered as User. First Register as User",
      403,
    );
  const userId = user.id;
  const allowedWageType = ["MONTHLY", "DAILY"];
  if (!allowedWageType.includes(wageType))
    throwError("Wage Type can either be 'MONTHLY' or 'DAILY'", 400);
  if (phone !== null) {
    const foundPhone = await prisma.employee.findUnique({
      where: {
        phone,
      },
    });
    if (foundPhone) throwError("This Phone Number is already Registered", 400);
  }

  const employee = await prisma.employee.create({
    data: {
      userId,
      name,
      phone,
      wageType,
      wageAmount,
    },
  });
  return employee;
};

const getAllEmployees = async () => {
  const employees = await prisma.employee.findMany({});
  return employees;
};

const getEmployeeById = async (name) => {
  const employee = await prisma.employee.findUnique({ where: { name } });
  if (!employee) throwError("Employee Doesnot Exists", 400);
  return employee;
};

const deactivateEmployee = async (name) => {
  const employee = await prisma.employee.update({
    where: { name },
    data: {
      isActive: false,
    },
  });
  return employee;
};

const updateEmployee = async (name, updateData) => {
  const employee = await getEmployeeById(name);
  if (!employee.isActive)
    throwError("Employee is not active (i.e its deleted).", 400);

  const dataToUpdate = {};

  // Basic fields
  if (updateData.name !== undefined) dataToUpdate.name = updateData.name;
  if (updateData.phone !== undefined) {
    const foundPhone = await prisma.employee.findUnique({
      where: {
        phone: updateData.phone,
      },
    });
    if (foundPhone) throwError("This Phone Number is already Registered", 400);
    dataToUpdate.phone = updateData.phone;
  }
  if (updateData.wageType !== undefined) {
    const allowedWageType = ["MONTHLY", "DAILY"];
    if (!allowedWageType.includes(updateData.wageType))
      throwError("Wage Type can either be 'MONTHLY' or 'DAILY'", 400);
    dataToUpdate.wageType = updateData.wageType;
  }
  if (updateData.wageAmount !== undefined)
    dataToUpdate.wageAmount = updateData.wageAmount;

  const updatedEmployee = await prisma.employee.update({
    where: {
      name,
    },
    data: dataToUpdate,
  });

  return updatedEmployee;
};

const createCommission = async (
  name,
  commissionType,
  commissionValue,
  commissionPeriod,
) => {
  const employee = await prisma.employee.findUnique({ where: { name } });
  if (!employee) throwError(`Employee with name (${name}) is NOT FOUND`);
  const empId = employee.id;
  const existingEmployee = await prisma.employeeCommissionRule.findUnique({
    where: { employeeId: empId },
  });
  if (existingEmployee) throwError("Employee is already Registered", 400);

  const allowedWageType = ["MONTHLY", "DAILY"];
  if (!allowedWageType.includes(commissionPeriod))
    throwError("Commission Period can either be 'MONTHLY' or 'DAILY'", 400);

  const allowedCommissionType = [
    "SALE_PERCENT",
    "PROFIT_PERCENT",
    "FIXED_PER_SALE",
  ];
  if (!allowedCommissionType.includes(commissionType))
    throwError(
      "Commission Type can either be 'SALE_PERCENT' or 'PROFIT_PERCENT' or 'FIXED_PER_SALE'",
      400,
    );

  const emp = await prisma.employeeCommissionRule.create({
    data: {
      employeeId: empId,
      commissionType,
      commissionValue,
      commissionPeriod,
    },
  });
  return emp;
};

const updateCommissionRule = async (name, updateData) => {
  const employee = await getEmployeeById(name);
  if (!employee.isActive)
    throwError("Employee is not active (i.e its deleted).", 400);

  const emp = await prisma.employee.findUnique({ where: { name } });
  if (!emp) throwError(`Employee with name (${name}) is NOT FOUND`);

  const empId = emp.id;

  const allowedCommissionType = [
    "SALE_PERCENT",
    "PROFIT_PERCENT",
    "FIXED_PER_SALE",
  ];
  const allowedWageType = ["MONTHLY", "DAILY"];

  const dataToUpdate = {};
  dataToUpdate.employeeId = empId;

  // Basic fields
  if (updateData.commissionType !== undefined) {
    if (!allowedCommissionType.includes(updateData.commissionType))
      throwError(
        "Commission Type can either be 'SALE_PERCENT' or 'PROFIT_PERCENT' or 'FIXED_PER_SALE'",
        400,
      );
    dataToUpdate.commissionType = updateData.commissionType;
  }

  if (updateData.commissionValue !== undefined)
    dataToUpdate.commissionValue = updateData.commissionValue;
  if (updateData.commissionPeriod !== undefined) {
    const allowedWageType = ["MONTHLY", "DAILY"];
    if (!allowedWageType.includes(updateData.commissionPeriod))
      throwError("Wage Type can either be 'MONTHLY' or 'DAILY'", 400);
    dataToUpdate.commissionPeriod = updateData.commissionPeriod;
  }

  const updatedEmployee = await prisma.employeeCommissionRule.update({
    where: {
      employeeId: empId,
    },
    data: dataToUpdate,
  });

  return updatedEmployee;
};

const getCommissionRules = async (name) => {
  const employee = await getEmployeeById(name);
  const employeeCommissionRules =
    await prisma.employeeCommissionRule.findUnique({
      where: { employeeId: employee.id },
    });
  return employeeCommissionRules;
};

const calculateCommission = async (name, startDate, endDate) => {
  const employee = await getEmployeeById(name);
  if (!employee) throwError("No Employee Found", 400);

  const empId = employee.id;

  const emp = await prisma.employeeCommissionRule.findUnique({
    where: { employeeId: empId },
  });
  if (!emp) throwError("No Commission Rule Exist for Employee", 400);

  const getALlSales = await getValidSalesByDateRange(startDate, endDate);

  let commValue = 0;
  if (
    emp.commissionType === "PROFIT_PERCENT" ||
    emp.commissionType === "SALE_PERCENT"
  ) {
    const value = emp.commissionValue / 100;
    if (emp.commissionType === "PROFIT_PERCENT") {
      commValue = value * (getALlSales._sum.totalProfit || 0);
    } else if (emp.commissionType === "SALE_PERCENT") {
      commValue = value * (getALlSales._sum.totalAmount || 0);
    }
  } else if (emp.commissionType === "FIXED_PER_SALE") {
    const result = await getValidSalesByDateRangeAndId(
      empId,
      startDate,
      endDate,
    );
    result.forEach((sale) => {
      const saleItems = sale.saleItems;
      saleItems.forEach((saleItem) => {
        const commissionRate = saleItem.product.commissionRate || 0;
        const quantity = saleItem.quantity;
        commValue += commissionRate * quantity;
      });
    });
    // const salesNumber = result._count.id || 0;
    // commValue = salesNumber*emp.commissionValue || 0;
  }
  return commValue;
};

const createEmployeePayment = async (
  empName,
  paymentType,
  amount,
  periodStart,
  periodEnd = null,
  note = null,
  createdByName,
) => {
  const allowedPaymentType = [
    "DAILY_WAGE",
    "MONTHLY_WAGE",
    "COMMISSION",
    "BONUS",
    "ADVANCE",
    "DEDUCTION",
  ];
  const employee = await prisma.employee.findUnique({
    where: { name: empName },
  });
  if (!employee) throwError(`Employee with name (${empName}) Not FOUND! First add this user as Employee`,400);
  const empId = employee.id;
  const user = await prisma.user.findUnique({
    where: { userName: createdByName },
  });
  if (!user) throwError("No User Found", 400);
  const userId = user.id;
  if (!allowedPaymentType.includes(paymentType))
    throwError("Payment Type is not Valid", 400);
  if (amount <= 0) throwError("Invalid Amount", 400);
  const start = new Date(periodStart);
  start.setHours(0, 0, 0, 0);
  let end;
  if (periodEnd) {
    end = new Date(periodEnd);
    end.setHours(23, 59, 59, 999);
  }
  const employeePayment = await prisma.employeePayment.create({
    data: {
      employeeId: empId,
      paymentType: paymentType,
      amount,
      periodStart: start,
      periodEnd: end,
      note,
      createdById: userId,
    },
  });
  await addCashLedgerEntry({
    direction: "OUT",
    amount: amount,
    sourceType: "EMPLOYEE_PAYMENT",
    sourceId: employeePayment.id,
    note: note,
  });
  return employeePayment;
};

const getEmployeePayments = async (name) => {
  const employee = await prisma.employee.findUnique({ where: { name } });
  if (!employee) throwError("Employee not Found", 400);
  const empId = employee.id;
  const empPayments = await prisma.employeePayment.findMany({
    where: { employeeId: empId },
  });
  return empPayments;
};

const getEmployeePaymentsByDateRange = async (name, startDate, endDate) => {
  const employee = await prisma.employee.findUnique({ where: { name } });
  if (!employee) throwError("Employee not Found", 400);
  const empId = employee.id;
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  const employeePayments = await prisma.employeePayment.findMany({
    where: {
      paymentDate: {
        gte: start,
        lte: end,
      },
      employeeId: empId,
    },
  });
  return employeePayments;
};

const getAllEmployeePayments = async (startDate, endDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  const employeePayments = await prisma.employeePayment.findMany({
    where: {
      paymentDate: {
        gte: start,
        lte: end,
      },
    },
  });
  return employeePayments;
};

const getTodayPaymentSum = async () => {
  const currentDate = new Date();
  const startOfDay = new Date(currentDate);
  startOfDay.setHours(0, 0, 0, 0);
  const payments = await prisma.employeePayment.aggregate({
    where: {
      paymentDate: {
        gte: startOfDay,
        lte: currentDate,
      },
    },
    _sum: {
      amount: true,
    },
  });
  return payments;
};
const getMonthPaymentSum = async () => {
  const currentDate = new Date();

  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );
  const payments = await prisma.employeePayment.aggregate({
    where: {
      paymentDate: {
        gte: startOfMonth,
        lte: currentDate,
      },
    },
    _sum: {
      amount: true,
    },
  });
  return payments;
};
const getTodayPayments = async () => {
  const currentDate = new Date();
  const startOfDay = new Date(currentDate);
  startOfDay.setHours(0, 0, 0, 0);
  const payments = await prisma.employeePayment.findMany({
    where: {
      periodStart: {
        gte: startOfDay,
        lte: currentDate,
      },
    },
  });
  return payments;
};

const getEmployeePaymentSumByDateRange = async (startDate, endDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  const employeePayments = await prisma.employeePayment.aggregate({
    where: {
      paymentDate: {
        gte: start,
        lte: end,
      },
    },
    _sum: {
      amount: true,
    },
  });
  return employeePayments;
};

module.exports = {
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
  getTodayPayments,
  getEmployeePaymentsByDateRange,
  getEmployeePaymentSumByDateRange,
  getTodayPaymentSum,
  getMonthPaymentSum,
};
