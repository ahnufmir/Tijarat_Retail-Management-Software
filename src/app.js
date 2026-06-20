require('dotenv').config() 

const express = require('express');
const path = require("path");
const router = require("../src/modules/auth/auth.routes");
const {checkForCookieAuhtentication} = require("../src/middlewares/auth")

const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8000;

app.use(cookieParser());
app.use(checkForCookieAuhtentication("token"));
app.use("/v0/auth", router);



app.listen(PORT, ()=>{
    console.log(`Server is live on Port ${PORT}`)
})