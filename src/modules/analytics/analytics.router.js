const express = require("express");
const analyticsRouter = express.Router();
const {calulcateTodayAnalyticsHandler, calulcateMonthAnalyticsHandler, calulcateDateRangeAnalyticsHanlder} = require("../analytics/analytics.controller")

analyticsRouter.get("/calculateAnalytics/today",calulcateTodayAnalyticsHandler);
analyticsRouter.get("/calculateAnalytics/month",calulcateMonthAnalyticsHandler);
analyticsRouter.get("/calculateAnalytics",calulcateDateRangeAnalyticsHanlder);

module.exports = analyticsRouter;