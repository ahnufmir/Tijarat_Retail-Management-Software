const path = require("path");
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const express = require("express");
const router = require("../src/modules/auth/auth.routes");
const productRouter = require("../src/modules/products/prod.routes");
const inventoryRouter = require("../src/modules/inventory/inv.routes");
const salesRouter = require("../src/modules/sales/sales.routes");
const employeesRouter = require("../src/modules/employees/emp.routes");
const expenseRouter = require("../src/modules/expenses/exp.routes");
const ledgerRouter = require("../src/modules/ledger/ledger.routes")
const analyticsRouter = require("../src/modules/analytics/analytics.router")
const { checkForCookieAuhtentication,requireAuth } = require("../src/middlewares/auth");
const errorMiddleware = require("../src/middlewares/error");

const cookieParser = require("cookie-parser");

const app = express();
const PORT = 8000;

app.use(express.json());
app.use(cookieParser());
app.use(checkForCookieAuhtentication("token"));
app.use("/v0/auth", router);

app.use(requireAuth); 
// Protected Routes
app.use("/v0/products", productRouter);
app.use("/v0/inventory", inventoryRouter);
app.use("/v0/sales",salesRouter);
app.use("/v0/employees", employeesRouter);
app.use("/v0/expenses", expenseRouter);
app.use("/v0/ledger", ledgerRouter);
app.use("/v0/analytics", analyticsRouter);

// Error handling middleware
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is live on Port ${PORT}`);
});
