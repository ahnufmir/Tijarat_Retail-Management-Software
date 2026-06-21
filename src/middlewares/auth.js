const { validateToken } = require("../modules/auth/auth.service");
const sendResponse = require("../utils/sendResponse")


function checkForCookieAuhtentication(cookieName){
    return ((req,res,next)=>{
        const tokenCookieValue = req.cookies[cookieName];
        if(!tokenCookieValue) return next();

        try{
            const payload = validateToken(tokenCookieValue);
            req.user = payload;
        }
        catch(error){
        }
        return next();
    })
}

function requireAuth(req, res, next) {
  if (!req.user) 
    sendResponse(res,401,false,"Authentication required");

  return next();
}


function requireAdmin(req, res, next) {
  if (!req.user)
    sendResponse(res,401,false,"Authentication required");

  if (req.user.role !== "ADMIN") 
    sendResponse(res,403,false,"Admin access required");

  return next();
}

module.exports = {
    checkForCookieAuhtentication,
    requireAuth,
    requireAdmin
}