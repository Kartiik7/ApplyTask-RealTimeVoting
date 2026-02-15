const AppError = require('../../../utils/AppError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      error: err.message,
    });
  } else {
    console.error('ERROR 💥', err);
    res.status(500).json({
      success: false,
      status: 'error',
      error: 'Something went wrong!',
    });
  }
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err, message: err.message };
    
    if (err.name === 'CastError') error = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
    if (err.code === 11000) error = new AppError('Duplicate field value entered', 400);
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(el => el.message);
      error = new AppError(`Invalid input data. ${errors.join('. ')}`, 400);
    }

    sendErrorProd(error, res);
  }
};

module.exports = globalErrorHandler;
