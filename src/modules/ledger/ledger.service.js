const prisma = require("../../db/prisma");
const throwError = require("../../utils/errorHandling");

const addCashLedgerEntry = async (
  { direction, amount, sourceType, sourceId, note = null },
  tx = null,
) => {
  const allowedDirection = ["IN", "OUT"];
  const allowedSourceType = [
    "EXPENSE",
    "SALE",
    "CANCEL_SALE",
    "RETURN_SALE",
    "EMPLOYEE_PAYMENT",
    "STOCK_ADDED",
    "MANUAL_ADJUSTMENT",
  ];
  if (!allowedDirection.includes(direction))
    throwError("Direction can be either 'IN' or 'OUT'", 400);
  if (!allowedSourceType.includes(sourceType))
    throwError("Source Type is not Valid", 400);
  if (sourceId == null) throwError("Source Id is undefined", 400);
  const client = tx || prisma;
  const entry = await client.cashLedger.create({
    data: {
      direction,
      amount,
      sourceType,
      sourceId,
      note,
    },
  });
  return entry;
};

const updateCashLedgerEntry = async ({sourceType, sourceId, amount}) => {
  const checkEntry = await prisma.cashLedger.findUnique({
    where: {
      sourceType_sourceId: {
        sourceType,
        sourceId,
      },
    },
  });
  if (!checkEntry) throwError("Entry not Found", 400);
  const updateEntry = await prisma.cashLedger.update({
    where:{
        id:checkEntry.id
    },
    data:{
        amount
    }
  })
  return updateEntry;
};

module.exports = {
  addCashLedgerEntry,
  updateCashLedgerEntry
};
