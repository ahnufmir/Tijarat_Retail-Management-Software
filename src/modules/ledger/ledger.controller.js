const asyncHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/sendResponse");
const { isValidDateRange } = require("../../utils/dateValidation");
const {calulcateTodayAnalytics} = require("../ledger/ledger.service")

const calulcateTodayAnalyticsHandler = asyncHandler(async(req,res) => {
    const analytics = await calulcateTodayAnalytics();
    sendResponse(res,200,true,"Analytics Fetched Successfully",analytics);
})

module.exports = {
    calulcateTodayAnalyticsHandler
}