const asynHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/sendResponse");
const { createSale } = require("../sales/sales.service");

const createSaleHandler = asynHandler(async (req, res) => {
//   const userId = req.user.id;
//   if (!userId)
//     return sendResponse(
//       res,
//       403,
//       false,
//       "UserId not Found (User is not Logged In)",
//     );
const userId = 4;
  const { paymentMethod, items, note } = req.body;
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
    return sendResponse(res, 400,false, "Invalid Payment Method");
  }
  if (paymentMethod == null || items == null)
    return sendResponse(res, 400, "Payment Method or Sale Items not Found");
  const saleItems = await createSale(paymentMethod, items, userId, note);
  return sendResponse(res,200,true,"Sales Created Successfully",saleItems);
});

module.exports = {createSaleHandler
}
