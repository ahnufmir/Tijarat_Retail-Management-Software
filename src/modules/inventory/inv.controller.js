const asynHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/sendResponse");
const {
  getAllInventoryMovements,
  getMovementByBarCode,
  getMovementsByType,
  getMovementsByDateRange,
} = require("../inventory/inv.service");

const getAllInventoryMovementsHandler = asynHandler(async (req, res) => {
  const movements = await getAllInventoryMovements();
  return sendResponse(
    res,
    200,
    true,
    "Inventory movements fetched successfully",
    movements,
  );
});

const getMovementByBarCodeHandler = asynHandler(async (req, res) => {
  const barcode = req.params.barcode;
  if (!barcode || barcode.trim() === "")
    return sendResponse(res, 400, false, "Invalid Barcode");
  const movements = await getMovementByBarCode(barcode);
  return sendResponse(
    res,
    200,
    true,
    "Inventory movements fetched successfully",
    movements,
  );
});

const getMovementsByTypeHandler = asynHandler(async (req, res) => {
  const { type } = req.query;
  if (!type || type.trim() === "")
    return sendResponse(res, 400, false, "Invalid Type");
  const movements = await getMovementsByType(type);
  return sendResponse(
    res,
    200,
    true,
    "Inventory movements fetched successfully",
    movements,
  );
});

const getMovementsByDateRangeHandler = asynHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  if (
    !startDate ||
    startDate.trim() === "" ||
    !endDate ||
    endDate.trim() === ""
  )
    return sendResponse(res, 400, false, "Invalid Date");
  const movements = await getMovementsByDateRange(startDate, endDate);
  return sendResponse(
    res,
    200,
    true,
    "Inventory movements fetched successfully",
    movements,
  );
});

module.exports = {
  getAllInventoryMovementsHandler,
  getMovementByBarCodeHandler,
  getMovementsByTypeHandler,
  getMovementsByDateRangeHandler,
};
