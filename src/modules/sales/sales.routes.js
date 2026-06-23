const express = require("express");
const salesRouter = express.Router();

const {createSaleHandler, getTodaySalesHandler, getSaleByIdHandler, getSaleByInvoiceHandler, cancelSaleHandler, returnSaleHandler} = require("../sales/sales.controller");

salesRouter.post("/",createSaleHandler);
salesRouter.get("/getSales/today", getTodaySalesHandler);
salesRouter.get("/id/:id", getSaleByIdHandler);
salesRouter.get("/invoice/:invoice", getSaleByInvoiceHandler);
salesRouter.post("/cancel/:invoice", cancelSaleHandler);
salesRouter.post("/return/:invoice", returnSaleHandler);

module.exports = salesRouter;