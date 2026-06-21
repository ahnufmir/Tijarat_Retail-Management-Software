const prisma = require("../../db/prisma");
const throwError = require("../../utils/errorHandling");
const asynHandler = require("../../utils/asyncHandler");

const createInventoryMovement = async ({
  productBarcode,
  quantityChange,
  movementType,
  note,
}) => {
  const quantity = Number(quantityChange);
  if (
    productBarcode === null ||
    quantityChange === null ||
    movementType === null ||
    isNaN(quantityChange) ||
    movementType === ""
  )
    throwError(400, "Invalid Parameter(s)");
  await prisma.inventoryMovement.create({
    data: {
      productBarcode: productBarcode,
      quantityChange: quantityChange,
      movementType: movementType,
      note: note,
    },
  });
};

module.exports = {
  createInventoryMovement,
};
