const prisma = require("../../db/prisma");
const throwError = require("../../utils/errorHandling");

const createInventoryMovement = async ({
  productBarcode,
  quantityChange,
  movementType,
  note,
},  tx = null) => {
  const quantity = Number(quantityChange);
  if (
    !productBarcode ||
    productBarcode.trim() === "" ||
    quantityChange == null ||
    movementType == null ||
    isNaN(quantity) ||
    movementType === ""
  )
    throwError("Invalid Parameter(s)", 400);
  if (quantity === 0) throwError("Quantity cannot be zero", 400);

  const client = tx || prisma;
  await client.inventoryMovement.create({
    data: {
      productBarcode: productBarcode,
      quantityChange: quantity,
      movementType: movementType,
      note: note,
    },
  });
};

const getAllInventoryMovements = async () => {
  const movements = await prisma.inventoryMovement.findMany({
    orderBy: {
      movementDate: "desc",
    },
  });
  return movements;
};

const getMovementByBarCode = async (barcode) => {
  const movements = await prisma.inventoryMovement.findMany({
    where: {
      productBarcode: barcode,
    },
    orderBy: {
      movementDate: "desc",
    },
  });
  return movements;
};

const getMovementsByType = async (type) => {
  const allowedTypes = [
    "INITIAL_STOCK",
    "PURCHASE",
    "SALE",
    "RETURN",
    "DAMAGE",
    "ADJUSTMENT",
    "DELETED",
  ];

  if (!allowedTypes.includes(type)) {
    throwError("Invalid movement type", 400);
  }
  const movements = await prisma.inventoryMovement.findMany({
    where: {
      movementType: type,
    },
    orderBy: {
      movementDate: "desc",
    },
  });
  return movements;
};

const getMovementsByDateRange = async (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const currentDate = new Date();
  
  // Create date-only versions for comparison
  const endDateOnly = new Date(endDate);
  endDateOnly.setHours(0, 0, 0, 0);
  const todayOnly = new Date();
  todayOnly.setHours(0, 0, 0, 0);
  
  // Check if end date is in the future (not today)
  if (endDateOnly > todayOnly) {
    throwError("Invalid Date - Cannot query future dates", 400);
  }
  
  // If end date is today, use current time instead of end of day
  if (endDateOnly.getTime() === todayOnly.getTime()) {
    end.setTime(currentDate.getTime());
  } else {
    // End date is in the past, use end of that day
    end.setHours(23, 59, 59, 999);
  }
  
  if (
    isNaN(start.getTime()) ||
    isNaN(end.getTime()) ||
    start > end
  )
    throwError("Invalid Date", 400);
  const movements = await prisma.inventoryMovement.findMany({
    where: {
      movementDate: {
        gte: start,
        lte: end,
      },
    },
    orderBy: {
      movementDate: "desc",
    },
  });
  return movements;
};

module.exports = {
  createInventoryMovement,
  getAllInventoryMovements,
  getMovementByBarCode,
  getMovementsByType,
  getMovementsByDateRange,
};
