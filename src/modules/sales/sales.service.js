const { it } = require("node:test");
const prisma = require("../../db/prisma");
const throwError = require("../../utils/errorHandling");
const {
  createInventoryMovement,
  getMovementsByType,
} = require("../inventory/inv.service");
const { SALESTATUS } = require("@prisma/client");

const generateInvoice = async (tx) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todaySalesCount = await tx.sale.count({
    where: {
      saleDate: {
        gte: todayStart,
      },
    },
  });

  const datePart = `${todayStart.getFullYear()}${(todayStart.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${todayStart.getDate().toString().padStart(2, "0")}`;

  const invoice = `INV-${datePart}-${String(todaySalesCount + 1).padStart(4, "0")}`;

  return invoice;
};

module.exports = generateInvoice;

const createSale = async (paymentMethod, items, userName, note = null) => {
  // Find user by username

  const user = await prisma.user.findUnique({
    where: {
      userName,
    },
  });

  if (!user) {
    throwError("User not found", 404);
  }

  const userId = user.id;
  let totalProfit = 0;
  let totalAmount = 0;
  let totalCost = 0;

  let salesItemArray = [];
  const productsBarcodes = [];

  // =========================
  // FIX 1: MERGE DUPLICATE PRODUCTS
  // =========================
  const mergedItemsMap = {};

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (!mergedItemsMap[item.productBarcode]) {
      mergedItemsMap[item.productBarcode] = {
        productBarcode: item.productBarcode,
        quantity: item.quantity,
        unitSellingPrice: item.unitSellingPrice,
      };
    } else {
      mergedItemsMap[item.productBarcode].quantity += item.quantity;
    }
  }

  const mergedItems = Object.values(mergedItemsMap);

  for (let index = 0; index < mergedItems.length; index++) {
    productsBarcodes[index] = mergedItems[index].productBarcode;
  }

  const products = await prisma.product.findMany({
    where: { barcode: { in: productsBarcodes } },
  });

  const productMap = {};
  for (let i = 0; i < products.length; i++) {
    productMap[products[i].barcode] = products[i];
  }

  // =========================
  // FEATURE ADDED: PARTIAL PROCESSING (SUCCESS + FAIL TRACKING)
  // 🟢 NEW FEATURE START
  // =========================
  let failedItems = [];
  let warnings = [];

  for (let index = 0; index < mergedItems.length; index++) {
    const item = mergedItems[index];
    const product = productMap[item.productBarcode];

    // product not found → mark as failed, do NOT stop execution
    if (!product) {
      failedItems.push({
        productBarcode: item.productBarcode,
        reason: "Product not found",
      });
      continue;
    }

    const itemQuantity = item.quantity;
    const itemSellingPrice = item.unitSellingPrice;

    // selling price validation against cost price
    if (itemSellingPrice < product.unitCostPrice) {
      failedItems.push({
        productBarcode: item.productBarcode,
        reason: "Selling price is lower than cost price",
        costPrice: product.unitCostPrice,
        sellingPrice: itemSellingPrice,
      });
      continue;
    }

    // stock validation → do not throw, just record failure
    if (itemQuantity > product.currentQuantity) {
      failedItems.push({
        productBarcode: item.productBarcode,
        reason: "Insufficient stock",
        available: product.currentQuantity,
        requested: itemQuantity,
      });
      continue;
    }

    const lineTotal = itemSellingPrice * itemQuantity;
    const lineCost = product.unitCostPrice * itemQuantity;

    totalAmount += lineTotal;
    totalCost += lineCost;

    salesItemArray.push({
      productBarcode: item.productBarcode,
      quantity: itemQuantity,
      unitSellingPrice: itemSellingPrice,
      unitCostPrice: product.unitCostPrice,
      lineTotal,
      lineCost,
      lineProfit: lineTotal - lineCost,
    });
  }

  // if nothing is valid → hard stop (important)
  if (salesItemArray.length === 0) {
    throwError("No valid items to create sale", 400);
  }

  totalProfit = totalAmount - totalCost;

  // =========================
  // TRANSACTION (UNCHANGED STRUCTURE)
  // =========================
  const result = await prisma.$transaction(async (tx) => {
    const invoice = await generateInvoice(tx); // 🟢 INVOICE GENERATED HERE
    const sale = await tx.sale.create({
      data: {
        userId,
        paymentMethod,
        totalAmount,
        totalCost,
        totalProfit,
        invoice,
        status: "ACTIVE",
      },
    });

    const saleID = sale.id;

    const finalSalesItems = salesItemArray.map((item) => ({
      ...item,
      saleId: saleID,
    }));

    await tx.saleItem.createMany({
      data: finalSalesItems,
    });

    for (let i = 0; i < salesItemArray.length; i++) {
      await tx.product.update({
        where: { barcode: salesItemArray[i].productBarcode },
        data: {
          currentQuantity: {
            decrement: salesItemArray[i].quantity,
          },
        },
      });

      await createInventoryMovement(
        {
          productBarcode: salesItemArray[i].productBarcode,
          quantityChange: -salesItemArray[i].quantity,
          movementType: "SALE",
          note: note,
        },
        tx,
      );
    }

    return sale;
  });

  // 🟢 NEW FEATURE END: attach warnings to response
  return {
    sale: result,
    warnings,
    failedItems,
  };
};

const getTodaySales = async () => {
  const currentDate = new Date();

  const startOfDay = new Date(currentDate);
  startOfDay.setHours(0, 0, 0, 0);

  const sales = await prisma.sale.findMany({
    where: {
      saleDate: {
        gte: startOfDay,
        lte: currentDate,
      },
    },
    select: {
      id: true,
      userId: true,
      invoice: true,
      paymentMethod: true,
      totalAmount: true,
      totalCost: true,
      totalProfit: true,
      saleDate: true,
      saleItems: true,
    },
  });
  return sales;
};

const getSaleById = async (id) => {
  const sale = await prisma.sale.findUnique({
    where: {
      id,
    },
  });
  return sale;
};

const getSaleByInvoice = async (invoice) => {
  const sale = await prisma.sale.findUnique({
    where: {
      invoice,
    },
  });
  return sale;
};

const cancelSale = async (invoice, note) => {
  const sale = await prisma.sale.findUnique({
    where: {
      invoice,
    },
  });
  if (!sale) throwError("No Sale Found", 400);
  if (sale.status !== "ACTIVE") {
    throwError("Sale is not active", 400);
  }
  const saleId = sale.id;
  const saleItem = await prisma.saleItem.findMany({
    where: {
      saleId,
    },
  });

  const movementType = "SALE_CANCEL";
  const result = await prisma.$transaction(async (tx) => {
    for (let i = 0; i < saleItem.length; i++) {
      let barcode = saleItem[i].productBarcode;
      let quantity = saleItem[i].quantity;
      await tx.product.update({
        where: { barcode },
        data: {
          currentQuantity: {
            increment: quantity,
          },
        },
      });
      await createInventoryMovement(
        {
          productBarcode: barcode,
          quantityChange: quantity,
          movementType: movementType,
          note: note,
        },
        tx,
      );
    }

    const updatedSale = await tx.sale.update({
      where: {
        id: saleId,
      },
      data: {
        status: SALESTATUS.CANCELLED,
      },
    });
    return updatedSale;
  });
  return result;
};

// Helper fn of returnSale
const checkReturnHistory = async (
  finalItemsList,
  salesMap,
  failedItems,
  saleInvoice,
) => {
  const alreadyReturnedQty = await prisma.inventoryMovement.groupBy({
    by: ["productBarcode"],
    where: {
      movementType: "SALE_RETURN",
      note: saleInvoice,
    },
    _sum: {
      quantityChange: true,
    },
  });

  const returnedMap = {};

  for (let i = 0; i < alreadyReturnedQty.length; i++) {
    returnedMap[alreadyReturnedQty[i].productBarcode] =
      alreadyReturnedQty[i]._sum.quantityChange || 0;
  }

  for (let i = 0; i < finalItemsList.length; i++) {
    const barcode = finalItemsList[i].productBarcode;

    const saleItem = salesMap[barcode];
    if (!saleItem) continue;

    const alreadyReturnedQtySum = returnedMap[barcode] || 0;
    const remaining = saleItem.quantity - alreadyReturnedQtySum;

    if (finalItemsList[i].quantity > remaining) {
      failedItems.push({
        productBarcode: barcode,
        requestedQuantity: finalItemsList[i].quantity,
        saleQuantity: saleItem.quantity,
        reason: `Requested Quantity ${finalItemsList[i].quantity} cant be greater than Remaining Sold Quantity ${remaining}`,
      });

      finalItemsList.splice(i, 1);
      i--;
    }
  }

  return finalItemsList;
};

const returnSale = async (saleInvoice, items, notes = null) => {
  const sale = await prisma.sale.findUnique({
    where: {
      invoice: saleInvoice,
    },
  });

  //=================================== SALES VALIDATION =============================
  if (!sale) {
    throwError("Sale not found", 404);
  }
  if (sale.status === "CANCELLED" || sale.status === "RETURNED") {
    throwError("Cancelled/Returned sale cannot be returned", 400);
  }

  if (!items || items.length === 0) {
    throwError("No items provided for return", 400);
  }

  //==================================================================================
  const saleId = sale.id;
  const saleItems = await prisma.saleItem.findMany({
    where: {
      saleId,
    },
  });

  //============================ SALES + SALES ITEM VALIDATION =======================
  const salesMap = {};
  for (let i = 0; i < saleItems.length; i++) {
    salesMap[saleItems[i].productBarcode] = saleItems[i];
  }

  const finalItemsList = [];
  const failedItems = [];
  const processed = {};
  const warnings = [];

  for (let i = 0; i < items.length; i++) {
    const barcode = items[i].productBarcode;
    const requestedQty = items[i].quantity;
    if (requestedQty <= 0) {
      failedItems.push({
        productBarcode: barcode,
        requestedQuantity: requestedQty,
        saleQuantity: undefined,
        reason: "Product Quantity Cant be less than zero",
      });
      continue;
    }

    if (processed[barcode]) continue;
    processed[barcode] = true;

    const originalItem = salesMap[barcode];
    if (!originalItem) {
      failedItems.push({
        productBarcode: barcode,
        requestedQuantity: requestedQty,
        saleQuantity: undefined,
        reason: "Product Not Found in Sale",
      });
      continue;
    }
    const saleQty = originalItem.quantity;

    if (requestedQty <= saleQty) {
      finalItemsList.push(items[i]);
    } else {
      failedItems.push({
        productBarcode: barcode,
        requestedQuantity: requestedQty,
        saleQuantity: saleQty,
        reason:
          "Requested Quantity Cant be greater than Original Sale Quantity",
      });
    }
  }
  const FINALE = await checkReturnHistory(
    finalItemsList,
    salesMap,
    failedItems,
    saleInvoice,
  );
  let newStatus;
  if (FINALE.length === 0) {
    throwError("ALl Items are RETURNED", 400);
  }

  //================================================================================

  // -------------- JUST ADDED NOW TO CALCULATE COMMISSION
  let profit = 0;
  let sales = 0;
  let cost = 0;
  for (let index = 0; index < FINALE.length; index++) {
    const saleItem = salesMap[FINALE[index].productBarcode];
    const returnedQty = FINALE[index].quantity;
    profit += (saleItem.lineProfit / saleItem.quantity) * returnedQty;
    cost += (saleItem.lineCost / saleItem.quantity) * returnedQty;
    sales += (saleItem.lineTotal / saleItem.quantity) * returnedQty;
  }

  const newProfit = sale.totalProfit - profit;
  const newCost = sale.totalCost - cost;
  const newAmount = sale.totalAmount - sales;
  const updatedStatus =
  newAmount <= 0
    ? SALESTATUS.RETURNED
    : SALESTATUS.PARTIAL_RETURN;
  // -----------------------------------
  const movementType = "SALE_RETURN";

  const result = await prisma.$transaction(async (tx) => {
    for (let i = 0; i < FINALE.length; i++) {
      let barcode = FINALE[i].productBarcode;
      let quantity = FINALE[i].quantity;
      await tx.product.update({
        where: { barcode },
        data: {
          currentQuantity: {
            increment: quantity,
          },
        },
      });
      const inventory = await createInventoryMovement(
        {
          productBarcode: barcode,
          quantityChange: quantity,
          movementType: movementType,
          note: saleInvoice,
        },
        tx,
      );
    }

    const updatedSale = await tx.sale.update({
      where: {
        id: saleId,
      },
      data: {
        status: updatedStatus,
        //----------- TO calculate commission
        totalAmount: newAmount,
        totalCost: newCost,
        totalProfit: newProfit,
      },
    });
    return updatedSale;
  });
  return {
    sale: result,
    warnings,
    failedItems,
  };
};

// for (let i = 0; i < items.length; i++) {
//   let check = true;
//   for (let j = 0; j < validatedIems.length; j++) {
//     if (items[i].productBarcode  === validatedIems[j].productBarcode) check = false;
//   }
//   if (check) failedItems.push(items);
// }

const getSalesByDateRange = async (startDate, endDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  const totalSales = await prisma.sale.aggregate({
    where: {
      saleDate: {
        gte: start,
        lte: end,
      },
    },
    _sum: {
      totalCost: true,
      totalAmount: true,
      totalProfit: true,
    },
  });
  return totalSales;
};

const getValidSalesByDateRange = async (startDate, endDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  const totalSales = await prisma.sale.aggregate({
    where: {
      saleDate: {
        gte: start,
        lte: end,
      },
      status: { in: ["ACTIVE", "PARTIAL_RETURN"] },
    },
    _sum: {
      totalCost: true,
      totalAmount: true,
      totalProfit: true,
    },
    _count: {
      id: true,
    },
  });
  return totalSales;
};
const getValidSalesByDateRangeAndId = async (id, startDate, endDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  const totalSales = await prisma.sale.findMany({
    where: {
      saleDate: {
        gte: start,
        lte: end,
      },
      status: {
        in: ["ACTIVE", "PARTIAL_RETURN"],
      },
      userId: id,
    },
    include: {
      saleItems: {
        include: {
          product: true,
        },
      },
    },
  });
  return totalSales;
};

module.exports = {
  createSale,
  getTodaySales,
  getSaleById,
  getSaleByInvoice,
  cancelSale,
  returnSale,
  getSalesByDateRange,
  getValidSalesByDateRange,
  getValidSalesByDateRangeAndId,
};
