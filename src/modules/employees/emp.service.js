const prisma = require("../../db/prisma");
const throwError = require("../../utils/errorHandling");
const { getValidSalesByDateRange, getValidSalesByDateRangeAndId } = require("../sales/sales.service");

const createEmployee = async ({
  userId,
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
      id: userId,
    },
  });
  if (!user)
    throwError(
      "Employee is not Registered as User. First Register as User",
      403,
    );
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
};

const updateEmployee = async (name, updateData) => {
  const employee = await getEmployeeById(name);
  if (!employee.isActive === false)
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
  if (!employee)
    throwError(`Employee with name (${employee.name}) is NOT FOUND`);
  const empId = employee.id;
  const existingEmployee = await prisma.employeeCommissionRule.findUnique({
    where: { id: empId },
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
  if (!employee.isActive === false)
    throwError("Employee is not active (i.e its deleted).", 400);

  const emp = await prisma.employee.findUnique({ where: { name } });
  if (!emp) throwError(`Employee with name (${emp.name}) is NOT FOUND`);

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

  let commValue;
  if (
    emp.commissionType === "PROFIT_PERCENT" ||
    emp.commissionType === "SALE_PERCENT"
  ) {
    const value = emp.commissionValue / 100;
    if (emp.commissionType === "PROFIT_PERCENT") {
      commValue = value * (getALlSales._sum.totalProfit || 0);
    } 
    else if (emp.commissionType === "SALE_PERCENT") {
      commValue = value * (getALlSales._sum.totalAmount || 0);
    }
  } 
  else if (emp.commissionType === "FIXED_PER_SALE") {
    const result = await getValidSalesByDateRangeAndId(empId,startDate,endDate);
    const salesNumber = result._count.id || 0;
    commValue = salesNumber*emp.commissionValue || 0;

  }
  return commValue;
};
