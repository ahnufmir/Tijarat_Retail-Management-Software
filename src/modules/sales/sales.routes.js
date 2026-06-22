const express = require("express");
const salesRouter = express.Router();

const {createSaleHandler} = require("../sales/sales.controller");

salesRouter.post("/", createSaleHandler);

module.exports = salesRouter;