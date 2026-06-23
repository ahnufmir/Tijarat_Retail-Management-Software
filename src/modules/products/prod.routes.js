const express = require("express");
const productRouter = express.Router();

const {
  createProductHandler,
  getAllProductsByTypeHandler,
  getProductByIdHandler,
  getProductByBarCodeHandler,
  deleteProductHandler,
  lowerStocksHandler,
  setProductStockHandler,
  adjustProductStockHandler,
  updateProductHandler,
} = require("../products/prod.controller");
const { requireAdmin } = require("../../middlewares/auth");

/*
========================================
🟢 CORE PRODUCT ROUTES (CRUD + SEARCH)
========================================
*/

// Create product
productRouter.post("/", createProductHandler);

// Get products by type (e.g. shirts, pants)
productRouter.get("/type/:type", getAllProductsByTypeHandler);

// Get product by ID (internal use)
productRouter.get("/id/:id", getProductByIdHandler);

// Get product by barcode (MAIN POS FEATURE)
productRouter.get("/barcode/:barcode", getProductByBarCodeHandler);

// Update product (admin)
productRouter.put("/update/:barcode", updateProductHandler);

// Delete product (admin only)
productRouter.delete("/delete/:barcode", deleteProductHandler);


/*
======================================== 
🟡 INVENTORY / STOCK MANAGEMENT
========================================
*/

// Set stock manually (fix inventory)
productRouter.patch("/stock/set/:barcode", setProductStockHandler);

// Adjust stock (sale or purchase update)
productRouter.patch("/stock/adjust/:barcode", requireAdmin, adjustProductStockHandler);

// Get low stock products (inventory alert system)
productRouter.get("/stock/low", lowerStocksHandler);

module.exports = productRouter;