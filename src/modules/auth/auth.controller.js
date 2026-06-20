const {
  registerAdmin,
  userLogin,
  getCurrentUser,
} = require("../auth/auth.service");
const asynHandler = require("../../utils/asyncHandler");
const prisma = require("../../db/prisma");

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
};

const registerAdminHandler = asynHandler(async (req, res) => {
  const { userName, password } = req.body;
  if (!userName || !password) {
    return res.status(400).json({
      success: false,
      message: "Either Username or password doesnot match",
    });
  }
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password Length should be greater than 6",
    });
  }
  const user = await registerAdmin({ userName, password });
  return res.status(201).json({
    success: true,
    message: "Admin Registed Successfully",
    data: user,
  });
});

const loginUserHandler = asynHandler(async (req, res) => {
  const { userName, password } = req.body;
  if (!userName || !password) {
    return res.status(400).json({
      success: false,
      message: "Either Username or password doesnot match",
    });
  }
  const { token, user } = await userLogin({ userName, password });
  res.cookie("token", token, cookieOptions);
  return res.status(200).json({
    success: true,
    message: "User Logged in",
    data: user,
  });
});

const logoutHandler = asynHandler(async (req, res) => {
  res.clearCookie("token", cookieOptions);
  return res.status(200).json({
    success: true,
    message: "User Logged Out",
  });
});

const getInfoAboutUserH = asynHandler(async (req, res) => {
  const user = await getCurrentUser(req.user.id);
  return res.status(200).json({
    success: true,
    message: "Get Info About User Succesfully",
    data: user,
  });
});

module.exports = {
    registerAdminHandler,
    loginUserHandler,
    logoutHandler,
    getInfoAboutUserH
}
