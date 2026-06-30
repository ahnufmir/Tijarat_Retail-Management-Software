const asyncHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/sendResponse");
const { isValidDateRange } = require("../../utils/dateValidation");
const {
  calulcateTodayAnalytics,
  calulcateMonthlyAnalytics,
  calulcateDateRangeAnalytics,
} = require("../analytics/analytics.service");

const calulcateTodayAnalyticsHandler = asyncHandler(async (req, res) => {
  const analytics = await calulcateTodayAnalytics();
  sendResponse(res, 200, true, "Analytics Fetched Successfully", analytics);
});
const calulcateMonthAnalyticsHandler = asyncHandler(async (req, res) => {
  const analytics = await calulcateMonthlyAnalytics();
  sendResponse(res, 200, true, "Analytics Fetched Successfully", analytics);
});

const calulcateDateRangeAnalyticsHanlder = asyncHandler(async (req, res) => {
  let { startDate, endDate } = req.query;

  startDate = startDate?.trim();
  endDate = endDate?.trim();

  if (!startDate || !endDate)
    return sendResponse(res,400,false,"Start Date and End Date are required");

  if (!isValidDateRange(startDate, endDate))
   return sendResponse(res,400,false,"Invalid Date Range");

  const analytics = await calulcateDateRangeAnalytics(startDate,endDate);
  return sendResponse(res,true, "Analytics Fetched Successfully", analytics);
});

module.exports = {
  calulcateTodayAnalyticsHandler,
  calulcateMonthAnalyticsHandler,
  calulcateDateRangeAnalyticsHanlder 

};
