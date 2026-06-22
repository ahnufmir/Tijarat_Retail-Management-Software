require("dotenv").config();

const express = require("express");
const path = require("path");
const router = require("../src/modules/auth/auth.routes");
const productRouter = require("../src/modules/products/prod.routes");
const inventoryRouter = require("../src/modules/inventory/inv.routes");
const salesRouter = require("../src/modules/sales/sales.routes");
const { checkForCookieAuhtentication } = require("../src/middlewares/auth");
const errorMiddleware = require("../src/middlewares/error");

const cookieParser = require("cookie-parser");

const app = express();
const PORT = 8000;

app.use(express.json());
app.use(cookieParser());
app.use(checkForCookieAuhtentication("token"));
app.use("/v0/auth", router);
app.use("/v0/products", productRouter);
app.use("/v0/inventory", inventoryRouter);
app.use("/v0/sales",salesRouter);

// Error handling middleware
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is live on Port ${PORT}`);
});
