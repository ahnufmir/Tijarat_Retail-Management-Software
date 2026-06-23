const express = require("express");
const { registerAdminHandler, loginUserHandler, logoutHandler, getInfoAboutUserH, registerUserHandler } = require("../auth/auth.controller")
const router = express.Router();

router.post("/registerAdmin",registerAdminHandler);
router.post("/registerUser",registerUserHandler);
router.post("/login", loginUserHandler);
router.post("/logout", logoutHandler);
router.post("/getInfo", getInfoAboutUserH);

module.exports = router;