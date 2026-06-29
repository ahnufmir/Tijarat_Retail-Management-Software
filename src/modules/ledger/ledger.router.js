const express = require("express");
const ledgerRouter = express.Router();
const {calulcateTodayAnalyticsHandler} = require("../ledger/ledger.controller")

ledgerRouter.get("/calculateAnalytics/today",calulcateTodayAnalyticsHandler);

module.exports = ledgerRouter;