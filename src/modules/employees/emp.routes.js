const express = require("express");
const employeeRouter = express.Router();

const {
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
} = require("./emp.controller");

/*
POST /employees
{
  "userName":"john123",
  "name":"John",
  "phone":"03001234567",
  "wageType":"MONTHLY",
  "wageAmount":50000
}
*/
employeeRouter.post("/", createEmployeeHandler);

/*
GET /employees
*/
employeeRouter.get("/", getAllEmployeesHandler);

/*
GET /employees/details?name=John
*/
employeeRouter.get("/details", getEmployeeByIdHandler);

/*
PATCH /employees/deactivate?name=John
*/
employeeRouter.patch("/deactivate", deactivateEmployeeHandler);

/*
PATCH /employees?name=John
{
  "phone":"03001234567",
  "wageType":"MONTHLY",
  "wageAmount":60000
}
*/
employeeRouter.patch("/", updateEmployeeHandler);

/*
POST /employees/commission?name=John
{
  "commissionType":"SALE_PERCENT",
  "commissionValue":5,
  "commissionPeriod":"MONTHLY"
}
*/
employeeRouter.post("/commission", createCommissionHandler);

/*
PATCH /employees/commission?name=John
{
  "commissionType":"PROFIT_PERCENT",
  "commissionValue":10,
  "commissionPeriod":"MONTHLY"
}
*/
employeeRouter.patch("/commission", updateCommissionRuleHandler);

/*
GET /employees/commission?name=John
*/
employeeRouter.get("/commission", getCommissionRulesHandler);

/*
GET /employees/commission/calculate?name=John&startDate=2026-06-01&endDate=2026-06-30
*/
employeeRouter.get("/commission/calculate", calculateCommissionHandler);

/*
POST /employees/payment
{
  "empName":"John",
  "paymentType":"MONTHLY_WAGE",
  "amount":50000,
  "periodStart":"2026-06-01",
  "periodEnd":"2026-06-30",
  "note":"June Salary",
  "createdByName":"admin"
}
*/
employeeRouter.post("/payment", createEmployeePaymentHandler);

/*
GET /employees/payment?name=John
*/
employeeRouter.get("/payment", getEmployeePaymentsHandler);

/*
GET /employees/payment/date-range?name=John&startDate=2026-06-01&endDate=2026-06-30
*/
employeeRouter.get(
  "/payment/date-range",
  getEmployeePaymentsByDateRangeHandler
);

/*
GET /employees/payment/all?startDate=2026-06-01&endDate=2026-06-30
*/
employeeRouter.get("/payment/all", getAllEmployeePaymentsHandler);

module.exports = employeeRouter;