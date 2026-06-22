class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;

    this.success = false;
  }
}

const throwError = (message, statusCode = 500) => {
  throw new AppError(message, statusCode);
};

module.exports = throwError;
