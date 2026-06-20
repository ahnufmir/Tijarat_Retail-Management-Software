class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

function throwError(message, statusCode) {
  throw new AppError(message, statusCode);
}

module.exports = throwError;
