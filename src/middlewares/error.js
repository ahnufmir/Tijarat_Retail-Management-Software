// const errorMiddleware = (err, req, res, next) => {
//   const statusCode = err.statusCode || 500;
//   const message = err.message || "Internal Server Error";
  
//   return res.status(statusCode).json({
//     success: false,
//     message: message,
//     statusCode: statusCode
//   });
// };

// module.exports = errorMiddleware;

const errorMiddleware = (err, req, res, next) => {
  console.error(err);
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
};

 module.exports = errorMiddleware;
