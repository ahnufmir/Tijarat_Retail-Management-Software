const { validateToken } = require("../modules/auth/auth.service");
const sendResponse = require("../utils/sendResponse")


function checkForCookieAuhtentication(cookieName) {
  return (req, res, next) => {
    const tokenCookieValue = req.cookies?.[cookieName];

    // no token → just continue (public route behavior)
    if (!tokenCookieValue) return next();

    try {
      const payload = validateToken(tokenCookieValue);
      req.user = payload;
    } catch (error) {
      // invalid token → IMPORTANT: clear user + continue OR block depending on design
      req.user = undefined;
    }

    return next();
  };
}

function requireAuth(req, res, next) {
  if (!req.user) 
    return sendResponse(res,401,false,"Authentication required");

  return next();
}


function requireAdmin(req, res, next) {
  if (!req.user)
    return sendResponse(res,401,false,"Authentication required");

  if (req.user.role !== "ADMIN") 
    return sendResponse(res,403,false,"Admin access required");

  return next();
}

module.exports = {
    checkForCookieAuhtentication,
    requireAuth,
    requireAdmin
}