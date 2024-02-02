const AppError = require("./AppError");

const duplicateError = (err) => {
  return new AppError(err.message, 400);
};

const validateError = (err) => {
  const message = Object.values(err.errors).map((e) => e.message);

  return new AppError(message, 400);
};

const errHandler = (err, res) => {
  if (process.env.NODE_ENV.trim() == "production") {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      res.status(500).json({
        status: "error",
        message: "Internel Server Error.",
      });
    }
  } else {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      err,
      errstack: err.stack,
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = { ...err, name: err.name, message: err.message };

  if (error.code == 11000) {
    error = duplicateError(error);
  }

  if (error.name == "ValidationError") {
    error = validateError(error);
  }

  errHandler(error, res);
};
