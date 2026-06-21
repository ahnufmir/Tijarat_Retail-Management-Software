const {
  createProduct,
  getAllProductsByType,
  getProductById,
  getProductByBarcode,
  deleteProduct,
  lowerStockProducts,
  setProductStock,
  adjustProductStock,
  updateProduct,
} = require("../products/prod.service");
const asynHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/sendResponse");

const createProductHandler = asynHandler(async (req, res) => {
  const {
    name,
    type,
    color,
    barcode,
    unitSellingPrice,
    unitCostPrice,
    initialQuantity,
    currentQuantity,
    lowStockThreshold,
  } = req.body;
  if (
    isNaN(unitSellingPrice) ||
    isNaN(unitCostPrice) ||
    unitSellingPrice == null ||
    unitCostPrice == null ||
    isNaN(barcode) ||
    barcode == null
  )
    return sendResponse(
      res,
      400,
      false,
      "Fix either barcode, unit Sell or cost price",
    );

  const product = await createProduct(
    name,
    type,
    color,
    barcode,
    unitSellingPrice,
    unitCostPrice,
    initialQuantity,
    currentQuantity,
    lowStockThreshold,
  );
  sendResponse(res, 201, true, "Admin Registed Successfully", product);
});

const getAllProductsByTypeHandler = asynHandler(async (req, res) => {
  const  type  = req.params.type;
  if (type == null || type === "" || type === " ")
    return sendResponse(
      res,
      400,
      false,
      "Fix either barcode, unit Sell or cost price",
    );

  const products = await getAllProductsByType(type);
  sendResponse(
    res,
    200,
    true,
    "Products of given type get succesfully",
    products,
  );
});

const getProductByIdHandler = asynHandler(async (req, res) => {
  const  id  = Number(req.params.id);
  const product = await getProductById(id);
  sendResponse(
    res,
    200,
    true,
    "Product with given ID get succesfully",
    product,
  );
});

const getProductByBarCodeHandler = asynHandler(async (req, res) => {
  const barcode = req.params.barcode
  const product = await getProductByBarcode(barcode);
  sendResponse(
    res,
    200,
    true,
    "Product with given barcode get succesfully",
    product,
  );
});

const deleteProductHandler = asynHandler(async (req, res) => {
  const barcode = req.params.barcode
  const product = await deleteProduct(barcode);
  sendResponse(res, 204, true, "Product deleted succesfully", product);
});

const lowerStocksHandler = asynHandler(async (req, res) => {
  const product = await lowerStockProducts();
  sendResponse(res, 200, true, "Lower Stocks get succesfully", product);
});

const setProductStockHandler = asynHandler(async (req, res) => {
  const barcode = req.params.barcode
  const num = Number(req.params.num);
  const product = await setProductStock(barcode, num);
  sendResponse(res, 200, true, "Product Stock Set Successfully", product);
});
const adjustProductStockHandler = asynHandler(async (req, res) => {
  const barcode = req.params.barcode
  const num = Number(req.params.num);
  const product = await adjustProductStock(barcode, num);
  sendResponse(res, 200, true, "Product Stock Adjusted Successfully", product);
});

const updateProductHandler = asynHandler(async (req, res) => {
  const barcode = req.params.barcode;
  const {
    name,
    type,
    color,
    unitSellingPrice,
    unitCostPrice,
    lowStockThreshold,
  } = req.body;
  const product = await updateProduct(barcode, {
    name,
    type,
    color,
    unitSellingPrice,
    unitCostPrice,
    lowStockThreshold,
  });
  sendResponse(res, 200, true, "Product updated succesfully", product);
});

module.exports = {
  createProductHandler,
  getAllProductsByTypeHandler,
  getProductByIdHandler,
  getProductByBarCodeHandler,
  deleteProductHandler,
  lowerStocksHandler,
  setProductStockHandler,
  adjustProductStockHandler,
  updateProductHandler,
};
