const express = require("express");

const {
  getAllInventoryMovementsHandler,
  getMovementByBarCodeHandler,
  getMovementsByTypeHandler,
  getMovementsByDateRangeHandler,
} = require("./inv.controller");

const inventoryRouter = express.Router();

/*
GET /inventory
*/
inventoryRouter.get(
  "/",
  getAllInventoryMovementsHandler
);

/*
GET /inventory/barcode/:barcode
*/
inventoryRouter.get(
  "/barcode/:barcode",
  getMovementByBarCodeHandler
);

/*
GET /inventory/type?type=SALE
*/
inventoryRouter.get(
  "/type",
  getMovementsByTypeHandler
);

/*
GET /inventory/date-range?startDate=2026-06-01&endDate=2026-06-30
*/
inventoryRouter.get(
  "/date-range",
  getMovementsByDateRangeHandler
);

module.exports = inventoryRouter;