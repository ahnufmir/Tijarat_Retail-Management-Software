// const prisma = require("../../db/prisma");
// const throwError = require("../../utils/errorHandling");
// const { createInventoryMovement } = require("../inventory/inv.service");

// const createSale = async (paymentMethod, items, userId,note=null) => {
//   let totalProfit = 0;
//   let totalAmount = 0;
//   let totalCost = 0;

//   let salesItemArray = [];
//   const productsBarcodes = [];

//   // =========================
//   // 🔥 FIX 1: MERGE DUPLICATE PRODUCTS (ADDED ONLY)
//   // =========================
//   const mergedItemsMap = {};

//   for (let i = 0; i < items.length; i++) {
//     const item = items[i];

//     if (!mergedItemsMap[item.productBarcode]) {
//       mergedItemsMap[item.productBarcode] = {
//         productBarcode: item.productBarcode,
//         quantity: item.quantity,
//         unitSellingPrice: item.unitSellingPrice,
//       };
//     } else {
//       mergedItemsMap[item.productBarcode].quantity += item.quantity;
//     }
//   }

//   const mergedItems = Object.values(mergedItemsMap);

//   // now use mergedItems instead of items
//   for (let index = 0; index < mergedItems.length; index++) {
//     productsBarcodes[index] = mergedItems[index].productBarcode;
//   }

//   const products = await prisma.product.findMany({
//     where: { barcode: { in: productsBarcodes } },
//   });

//   const productMap = {};
//   for (let i = 0; i < products.length; i++) {
//     productMap[products[i].barcode] = products[i];
//   }

//   // =========================
//   // MAIN LOOP NOW USES MERGED ITEMS
//   // =========================
//   for (let index = 0; index < mergedItems.length; index++) {
//     const item = mergedItems[index];
//     const product = productMap[item.productBarcode];

//     if (!product) {
//       throwError(`Product not found: ${item.productBarcode}`);
//     }

//     const itemQuantity = item.quantity;
//     const itemSellingPrice = item.unitSellingPrice;

//     // =========================
//     // FIX 2: STOCK CHECK (same as before but now correct with merged data)
//     // =========================
//     if (itemQuantity > product.currentQuantity) {
//       throwError(
//         `Insufficient stock for product ${item.productBarcode}. Available: ${product.currentQuantity}, Requested: ${itemQuantity}`,
//         400,
//       );
//     }

//     const lineTotal = itemSellingPrice * itemQuantity;
//     const lineCost = product.unitCostPrice * itemQuantity;

//     totalAmount += lineTotal;
//     totalCost += lineCost;

//     salesItemArray.push({
//       productBarcode: item.productBarcode,
//       quantity: itemQuantity,
//       unitSellingPrice: itemSellingPrice,
//       unitCostPrice: product.unitCostPrice,
//       lineTotal,
//       lineCost,
//       lineProfit: lineTotal - lineCost,
//     });
//   }

//   totalProfit = totalAmount - totalCost;

//   // transaction part unchanged (you already understood this well)
//   const result = await prisma.$transaction(async (tx) => {
//     const sale = await tx.sale.create({
//       data: {
//         userId,
//         paymentMethod,
//         totalAmount,
//         totalCost,
//         totalProfit,
//       },
//     });

//     const saleID = sale.id;

//     const finalSalesItems = salesItemArray.map((item) => ({
//       ...item,
//       saleId: saleID,
//     }));

//     await tx.saleItem.createMany({
//       data: finalSalesItems,
//     });

//     for (let i = 0; i < mergedItems.length; i++) {
//       await tx.product.update({
//         where: { barcode: mergedItems[i].productBarcode },
//         data: {
//           currentQuantity: {
//             decrement: mergedItems[i].quantity,
//           },
//         },
//       });
//       // Creating Inventory Movement
//       await createInventoryMovement({
//         productBarcode: mergedItems[i].productBarcode,
//         quantityChange: -mergedItems[i].quantity,
//         movementType: "SALE",
//         note: note,
//       }, tx);
//     }

//     return sale;
//   });

//   return result;
// };

// module.exports = {
//     createSale,

// }

const prisma = require("../../db/prisma");
const throwError = require("../../utils/errorHandling");
const { createInventoryMovement } = require("../inventory/inv.service");

const createSale = async (paymentMethod, items, userId, note = null) => {
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
    const sale = await tx.sale.create({
      data: {
        userId,
        paymentMethod,
        totalAmount,
        totalCost,
        totalProfit,
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
        tx
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

module.exports = {
  createSale,
};