const express = require("express");

const {
  addExpenseCategoryHandler,
  addExpenseHandler,
  updateExpenseHandler,
  getAllExpensesTodayHandler,
  getAllExpensesSumTodayHandler,
  getAllExpensesByDateRangeHandler,
  getAllExpensesSumByDateRangeHandler,
} = require("../expenses/exp.controller");

const expenseRouter = express.Router();

/*
POST /expenses/category
*/
expenseRouter.post("/category", addExpenseCategoryHandler);

/*
POST /expenses
*/
expenseRouter.post("/", addExpenseHandler);

/*
PUT /expenses/:id
*/
expenseRouter.put("/:id", updateExpenseHandler);

/*
GET /expenses/today
*/
expenseRouter.get("/today", getAllExpensesTodayHandler);

/*
GET /expenses/today/total
*/
expenseRouter.get("/today/total", getAllExpensesSumTodayHandler);

/*
GET /expenses/date-range?startDate=2026-06-01&endDate=2026-06-30
*/
expenseRouter.get("/date-range", getAllExpensesByDateRangeHandler);

/*
GET /expenses/date-range/total?startDate=2026-06-01&endDate=2026-06-30
*/
expenseRouter.get("/date-range/total", getAllExpensesSumByDateRangeHandler);

module.exports = expenseRouter;