const express = require("express");
const salesRouter = express.Router();

const {createSaleHandler, getTodaySalesHandler, getSaleByIdHandler, getSaleByInvoiceHandler, cancelSaleHandler, returnSaleHandler, getSalesByDateRangeHandler} = require("../sales/sales.controller");

salesRouter.post("/",createSaleHandler);
salesRouter.get("/getSales/today", getTodaySalesHandler);
salesRouter.get("/id/:id", getSaleByIdHandler);
salesRouter.get("/invoice/:invoice", getSaleByInvoiceHandler);
salesRouter.post("/cancel/:invoice", cancelSaleHandler);
salesRouter.post("/return/:invoice", returnSaleHandler);
/*
GET /inventory/date-range?startDate=2026-06-01&endDate=2026-06-30
*/
salesRouter.get(
  "/getSale",getSalesByDateRangeHandler
);

module.exports = salesRouter;