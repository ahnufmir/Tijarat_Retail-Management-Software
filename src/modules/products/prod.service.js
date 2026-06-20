const prisma = require("../../db/prisma");
const throwError = require("../../utils/errorHandling");

const createProduct = async (
  name,
  type,
  color,
  barcode,
  sp,
  cp,
  initialQuantity,
  currentQuantity,
  lowstock,
) => {
  const existingProduct = await prisma.product.findUnique({
    where: {
      barcode,
    },
  });
  if (existingProduct) throwError("Product Already Exists", 400);
  if (sp < 0 || cp < 0 || initialQuantity < 0 || lowstock < 0 || currentQuantity < 0 )
    throwError("Price or Quantity couldnot be less than zero", 400);
  if (sp < cp) throwError("Selling Price cant be less than cost price", 400);
  const product = await prisma.product.create({
    data: {
      name: name,
      type: type,
      color: color,
      barcode: barcode,
      unitSellingPrice: sp,
      unitCostPrice: cp,
      initialQuantity: initialQuantity,
      currentQuantity: currentQuantity,
      lowStockThreshold: lowstock,
    },
  });
  return product;
};

const getAllProductsByType = async (prodType) => {
  const products = await prisma.product.findMany({
    where: {
      type: prodType,
    },
  });
  return products;
};

const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
  });
  if (!product) throwError("Product doesnot Exists", 400);
  return product;
};

const getProductByBarcode = async (barcode) => {
  const product = await prisma.product.findUnique({
    where: {
      barcode,
    },
  });
  if (!product) throwError("Product doesnot Exists", 400);
  return product;
};

const updateProduct = async (barcode, updateData) => {
  const product = await getProductByBarcode(barcode);

  const dataToUpdate = {};

  if ("barcode" in updateData) {
    throwError("Barcode cannot be updated", 400);
  }

  // Basic fields
  if (updateData.name !== undefined) dataToUpdate.name = updateData.name;
  if (updateData.type !== undefined) dataToUpdate.type = updateData.type;
  if (updateData.color !== undefined) dataToUpdate.color = updateData.color;
  if (updateData.lowStockThreshold !== undefined)
    dataToUpdate.lowStockThreshold = updateData.lowStockThreshold;
  if (updateData.isActive !== undefined)
    dataToUpdate.isActive = updateData.isActive;

  // Prices
  const finalCost =
    updateData.unitCostPrice !== undefined
      ? updateData.unitCostPrice
      : product.unitCostPrice;

  const finalSelling =
    updateData.unitSellingPrice !== undefined
      ? updateData.unitSellingPrice
      : product.unitSellingPrice;

  // validation on final state
  if (finalCost < 0 || finalSelling < 0) {
    throwError("Price cannot be less than zero", 400);
  }

  if (finalSelling < finalCost) {
    throwError("Selling price cannot be less than cost price", 400);
  }

  // assign only after validation
  if (updateData.unitCostPrice !== undefined)
    dataToUpdate.unitCostPrice = updateData.unitCostPrice;

  if (updateData.unitSellingPrice !== undefined)
    dataToUpdate.unitSellingPrice = updateData.unitSellingPrice;

  const updatedProduct = await prisma.product.update({
    where: {
      barcode,
    },
    data: dataToUpdate,
  });

  return updatedProduct;
};

const deleteProduct = async (barCode) => {
  await getProductByBarcode(barCode);
  const deletedProd = await prisma.product.delete({
    where: {
      barcode: barCode,
    },
  });
  return deletedProd;
};

const lowerStockProducts = async () => {
  const products = await prisma.$queryRaw`
  SELECT *
  FROM "Product"
  WHERE "currentQuantity" <= "lowStockThreshold"
  `;
  return products;
};

const setProductStock = async (barCode, num) => {
  if (num == null || isNaN(num)) {
    throwError("Invalid quantity", 400);
  }
  if (num < 0) throwError("Quantity cant be less than zero", 400);
  const updatedProduct = await prisma.product.update({
    where: {
      barcode: barCode,
    },
    data: { currentQuantity: num },
  });
  return updatedProduct;
};

const adjustProductStock = async (barCode, num) => {
  if (num == null || isNaN(num) || num < 0) {
    throwError("Invalid quantity", 400);
  }
  const product = await getProductByBarcode(barCode);
  const newQuantity = product.currentQuantity + num;
  if (newQuantity < 0) {
    throwError("Stock cannot go below zero", 400);
  }
  const updatedProduct = await prisma.product.update({
    where: {
      barcode: barCode,
    },
    data: { currentQuantity: newQuantity },
  });
  return updatedProduct;
};

module.exports = {
  createProduct,
  getAllProductsByType,
  getProductById,
  getProductByBarcode,
  updateProduct,
  deleteProduct,
  lowerStockProducts,
  setProductStock,
  adjustProductStock,
};
