const { dir } = require("node:console");
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

const updateCashLedgerEntry = async (
  { direction, sourceType, sourceId, amount },
  tx,
) => {
  const allowedDirection = ["IN", "OUT"];
  if (!allowedDirection.includes(direction))
    throwError("Direction can either be 'IN' or 'OUT'", 400);
  const checkEntry = await prisma.cashLedger.findUnique({
    where: {
      sourceType_sourceId: {
        sourceType,
        sourceId,
      },
    },
  });
  if (!checkEntry) throwError("Entry not Found", 400);
  const client = tx || prisma;
  const updateEntry = await client.cashLedger.update({
    where: {
      id: checkEntry.id,
    },
    data: {
      amount,
      direction,
    },
  });
  return updateEntry;
};

const getAllInEntriesToday = async () => {
  const currentDate = new Date();
  const startOfDay = new Date(currentDate);
  startOfDay.setHours(0, 0, 0, 0);
  const expenses = await prisma.cashLedger.findMany({
    where: {
      entryDate: {
        gte: startOfDay,
        lte: currentDate,
      },
      direction: "IN",
    },
  });
  return expenses;
};

const getAllOutEntriesToday = async () => {
  const currentDate = new Date();
  const startOfDay = new Date(currentDate);
  startOfDay.setHours(0, 0, 0, 0);
  const expenses = await prisma.cashLedger.findMany({
    where: {
      entryDate: {
        gte: startOfDay,
        lte: currentDate,
      },
      direction: "OUT",
    },
  });
  return expenses;
};

const getAllEntriesToday = async () => {
  const currentDate = new Date();
  const startOfDay = new Date(currentDate);
  startOfDay.setHours(0, 0, 0, 0);
  const expenses = await prisma.cashLedger.findMany({
    where: {
      entryDate: {
        gte: startOfDay,
        lte: currentDate,
      },
    },
  });
  return expenses;
};

const getAllInEntriesSumToday = async () => {
  const currentDate = new Date();
  const startOfDay = new Date(currentDate);
  startOfDay.setHours(0, 0, 0, 0);
  const expenses = await prisma.cashLedger.aggregate({
    where: {
      entryDate: {
        gte: startOfDay,
        lte: currentDate,
      },
      direction: "IN",
    },
    _sum: {
      amount: true,
    },
  });
  return expenses;
};

const getAllOutEntriesSumToday = async () => {
  const currentDate = new Date();
  const startOfDay = new Date(currentDate);
  startOfDay.setHours(0, 0, 0, 0);
  const expenses = await prisma.cashLedger.aggregate({
    where: {
      entryDate: {
        gte: startOfDay,
        lte: currentDate,
      },
      direction: "OUT",
    },
    _sum: {
      amount: true,
    },
  });
  return expenses;
};

const getAllEntriesSumToday = async () => {
  const totalIn = await getAllInEntriesSumToday();
  const totalOut = await getAllOutEntriesSumToday();
  const total = totalIn._sum.amount - totalOut._sum.amount;
  return total;
};

const getAllInEntriesMonth = async () => {
  const currentDate = new Date();

  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );

  const entries = await prisma.cashLedger.findMany({
    where: {
      entryDate: {
        gte: startOfMonth,
        lte: currentDate,
      },
      direction: "IN",
    },
  });

  return entries;
};

const getAllOutEntriesMonth = async () => {
  const currentDate = new Date();

  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );

  const entries = await prisma.cashLedger.findMany({
    where: {
      entryDate: {
        gte: startOfMonth,
        lte: currentDate,
      },
      direction: "OUT",
    },
  });

  return entries;
};

const getAllEntriesMonth = async () => {
  const currentDate = new Date();

  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );

  const entries = await prisma.cashLedger.findMany({
    where: {
      entryDate: {
        gte: startOfMonth,
        lte: currentDate,
      },
    },
  });

  return entries;
};

const getAllInEntriesSumMonth = async () => {
  const currentDate = new Date();

  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );

  const entries = await prisma.cashLedger.aggregate({
    where: {
      entryDate: {
        gte: startOfMonth,
        lte: currentDate,
      },
      direction: "IN",
    },
    _sum: {
      amount: true,
    },
  });

  return entries;
};

const getAllOutEntriesSumMonth = async () => {
  const currentDate = new Date();

  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );

  const entries = await prisma.cashLedger.aggregate({
    where: {
      entryDate: {
        gte: startOfMonth,
        lte: currentDate,
      },
      direction: "OUT",
    },
    _sum: {
      amount: true,
    },
  });

  return entries;
};

const getAllEntriesSumMonth = async () => {
  const totalIn = await getAllInEntriesSumMonth();
  const totalOut = await getAllOutEntriesSumMonth();
  const total = totalIn._sum.amount - totalOut._sum.amount;
  return total;
};

const getAllEntriesByDateRange = async (startDate, endDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const entries = await prisma.cashLedger.findMany({
    where: {
      entryDate: {
        gte: start,
        lte: end,
      },
    },
  });

  return entries;
};

const getAllInEntriesByDateRange = async (startDate, endDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const entries = await prisma.cashLedger.findMany({
    where: {
      entryDate: {
        gte: start,
        lte: end,
      },
      direction: "IN",
    },
  });

  return entries;
};

const getAllOutEntriesByDateRange = async (startDate, endDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const entries = await prisma.cashLedger.findMany({
    where: {
      entryDate: {
        gte: start,
        lte: end,
      },
      direction: "OUT",
    },
  });

  return entries;
};

const getAllEntriesSumByDateRange = async (startDate, endDate) => {
  const totalIn = await getAllInEntriesSumByDateRange(startDate, endDate);
  const totalOut = await getAllOutEntriesSumByDateRange(startDate, endDate);
  const total = (totalIn._sum.amount || 0) - (totalOut._sum.amount || 0);
  return total;
};

const getAllInEntriesSumByDateRange = async (startDate, endDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const entries = await prisma.cashLedger.aggregate({
    where: {
      entryDate: {
        gte: start,
        lte: end,
      },
      direction: "IN",
    },
    _sum: {
      amount: true,
    },
  });

  return entries;
};

const getAllOutEntriesSumByDateRange = async (startDate, endDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const entries = await prisma.cashLedger.aggregate({
    where: {
      entryDate: {
        gte: start,
        lte: end,
      },
      direction: "OUT",
    },
    _sum: {
      amount: true,
    },
  });

  return entries;
};

module.exports = {
  addCashLedgerEntry,
  updateCashLedgerEntry,
  getAllOutEntriesToday,
  getAllInEntriesToday,
  getAllEntriesToday,
  getAllOutEntriesSumToday,
  getAllInEntriesSumToday,
  getAllEntriesSumToday,
  getAllInEntriesMonth,
  getAllOutEntriesMonth,
  getAllEntriesMonth,
  getAllInEntriesSumMonth,
  getAllOutEntriesSumMonth,
  getAllEntriesSumMonth,
  getAllEntriesByDateRange,
  getAllInEntriesByDateRange,
  getAllOutEntriesByDateRange,
  getAllEntriesSumByDateRange,
  getAllInEntriesSumByDateRange,
  getAllOutEntriesSumByDateRange,
};
