const express = require("express");
const ledgerRouter = express.Router();

const {
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
} = require("./ledger.controller");


// ================= TODAY =================

/*
GET /ledger/today
*/
ledgerRouter.get("/today", getAllEntriesTodayHandler);

/*
GET /ledger/today/in
*/
ledgerRouter.get("/today/in", getAllInEntriesTodayHandler);

/*
GET /ledger/today/out
*/
ledgerRouter.get("/today/out", getAllOutEntriesTodayHandler);

/*
GET /ledger/today/sum
*/
ledgerRouter.get("/today/sum", getAllEntriesSumTodayHandler);

/*
GET /ledger/today/sum/in
*/
ledgerRouter.get("/today/sum/in", getAllInEntriesSumTodayHandler);

/*
GET /ledger/today/sum/out
*/
ledgerRouter.get("/today/sum/out", getAllOutEntriesSumTodayHandler);


// ================= MONTH =================

/*
GET /ledger/month
*/
ledgerRouter.get("/month", getAllEntriesMonthHandler);

/*
GET /ledger/month/in
*/
ledgerRouter.get("/month/in", getAllInEntriesMonthHandler);

/*
GET /ledger/month/out
*/
ledgerRouter.get("/month/out", getAllOutEntriesMonthHandler);

/*
GET /ledger/month/sum
*/
ledgerRouter.get("/month/sum", getAllEntriesSumMonthHandler);

/*
GET /ledger/month/sum/in
*/
ledgerRouter.get("/month/sum/in", getAllInEntriesSumMonthHandler);

/*
GET /ledger/month/sum/out
*/
ledgerRouter.get("/month/sum/out", getAllOutEntriesSumMonthHandler);


// ================= DATE RANGE =================

/*
GET /ledger/range?startDate=2026-06-01&endDate=2026-06-30
*/
ledgerRouter.get("/range", getAllEntriesByDateRangeHandler);

/*
GET /ledger/range/in?startDate=2026-06-01&endDate=2026-06-30
*/
ledgerRouter.get("/range/in", getAllInEntriesByDateRangeHandler);

/*
GET /ledger/range/out?startDate=2026-06-01&endDate=2026-06-30
*/
ledgerRouter.get("/range/out", getAllOutEntriesByDateRangeHandler);

/*
GET /ledger/range/sum?startDate=2026-06-01&endDate=2026-06-30
*/
ledgerRouter.get("/range/sum", getAllEntriesSumByDateRangeHandler);

/*
GET /ledger/range/sum/in?startDate=2026-06-01&endDate=2026-06-30
*/
ledgerRouter.get("/range/sum/in", getAllInEntriesSumByDateRangeHandler);

/*
GET /ledger/range/sum/out?startDate=2026-06-01&endDate=2026-06-30
*/
ledgerRouter.get("/range/sum/out", getAllOutEntriesSumByDateRangeHandler);

module.exports = ledgerRouter;