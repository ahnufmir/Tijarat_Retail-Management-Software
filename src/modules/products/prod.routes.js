const express = require("express");
const router = express.Router();

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

/*
========================================
🟢 CORE PRODUCT ROUTES (CRUD + SEARCH)
========================================
*/

// Create product
router.post("/products", createProductHandler);

// Get products by type (e.g. shirts, pants)
router.get("/products/type/:type", getAllProductsByTypeHandler);

// Get product by ID (internal use)
router.get("/products/id/:id", getProductByIdHandler);

// Get product by barcode (MAIN POS FEATURE)
router.get("/products/barcode/:barcode", getProductByBarCodeHandler);

// Update product (admin)
router.put("/products/:barcode", updateProductHandler);

// Delete product (admin only)
router.delete("/products/:barcode", deleteProductHandler);


/*
========================================
🟡 INVENTORY / STOCK MANAGEMENT
========================================
*/

// Set stock manually (fix inventory)
router.patch("/products/stock/set/:barcode/:num", setProductStockHandler);

// Adjust stock (sale or purchase update)
router.patch("/products/stock/adjust/:barcode/:num", adjustProductStockHandler);

// Get low stock products (inventory alert system)
router.get("/products/stock/low", lowerStocksHandler);

module.exports = router;