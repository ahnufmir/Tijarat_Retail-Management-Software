const asynHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/sendResponse");
const {
  createSale,
  getTodaySales,
  getSaleByInvoice,
  getSaleById,
  returnSale,
  cancelSale,
} = require("../sales/sales.service");

function validateInvoiceStructure(invoice) {
  if (!invoice || typeof invoice !== "string") {
    return { valid: false, message: "Invoice is required" };
  }
  const parts = invoice.split("-");
  if (parts.length !== 3) {
    return { valid: false, message: "Invalid invoice format" };
  }
  const [prefix, datePart, sequence] = parts;
  // 1. Prefix check
  if (prefix !== "INV") {
    return { valid: false, message: "Invoice must start with INV" };
  }
  // 2. Date part check (YYYYMMDD)
  if (!/^\d{8}$/.test(datePart)) {
    return { valid: false, message: "Invalid date format in invoice" };
  }
  // 3. Sequence check (0001 format)
  if (!/^\d{4}$/.test(sequence)) {
    return { valid: false, message: "Invalid sequence format in invoice" };
  }
  return { valid: true };
}

const createSaleHandler = asynHandler(async (req, res) => {
  const userId = req.user.id;
  if (!userId)
    return sendResponse(
      res,
      403,
      false,
      "UserId not Found (User is not Logged In)",
    );
  const { paymentMethod, items,note } = req.body;
  const allowedPaymentMethods = [
    "CASH",
    "CARD",
    "BANK_TRANSFER",
    "EASYPAISA",
    "JAZZCASH",
    "SADAYPAY",
    "NAYAPAY",
    "CREDIT",
  ];
  if (!allowedPaymentMethods.includes(paymentMethod)) {
    return sendResponse(res, 400, false, "Invalid Payment Method");
  }
  if (paymentMethod == null || items == null)
    return sendResponse(res, 400, "Payment Method or Sale Items not Found");
  const saleItems = await createSale(paymentMethod, items, userId,note);
  return sendResponse(res, 200, true, "Sales Created Successfully", saleItems);
});

const getTodaySalesHandler = asynHandler(async (req, res) => {
  const sales = await getTodaySales();
  return sendResponse(
    res,
    200,
    true,
    "Today's Sales Retrieved Successfully",
    sales,
  );
});

const getSaleByIdHandler = asynHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (id == null || isNaN(id))
    return sendResponse(res, 400, false, "Invalid Invoice");
  const sale = await getSaleById(id);
  return sendResponse(res, 200, true, "Sale Retreived Successfully", sale);
});

const getSaleByInvoiceHandler = asynHandler(async (req, res) => {
  const invoice = req.params.invoice;
  const validation = validateInvoiceStructure(invoice);
  if (invoice == null || invoice === "")
    return sendResponse(res, 400, false, "Invalid Invoice");
  if (!validation.valid) {
    return sendResponse(res, 400, false, validation.message);
  }
  const sale = await getSaleByInvoice(invoice);
  return sendResponse(res, 200, true, "Sale Retreived Successfully", sale);
});

const cancelSaleHandler = asynHandler(async (req, res) => {
  const invoice = req.params.invoice;
  const note = req.body;
  if (invoice == null || invoice === "")
    return sendResponse(res, 400, false, "Invalid Invoice");
    const validation = validateInvoiceStructure(invoice);
  if (!validation.valid) {
    return sendResponse(res, 400, false, validation.message);
  }
  const sale = await cancelSale(invoice, note);
  return sendResponse(res, 200, true, "Sale Cancelled Successfully", sale);
});

const returnSaleHandler = asynHandler(async (req, res) => {
  const invoice = req.params.invoice;
  const { items, note } = req.body;
  if (invoice == null || invoice === "")
    return sendResponse(res, 400, false, "Invalid Invoice");
    const validation = validateInvoiceStructure(invoice);
  if (!validation.valid) {
    return sendResponse(res, 400, false, validation.message);
  }
  const sale = await returnSale(invoice, items, note);
  return sendResponse(res, 200, true, "Sale Returned Successfully", sale);
});

module.exports = {
  createSaleHandler,
  getTodaySalesHandler,
  getSaleByIdHandler,
  getSaleByInvoiceHandler,
  cancelSaleHandler,
  returnSaleHandler,
};
