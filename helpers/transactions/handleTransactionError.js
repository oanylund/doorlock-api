var handleTransactionError = function(err,next) {
  if(err.name === 'SequelizeValidationError') {
    err.message = 'Validation error',
    err.status = 400;
  }

  err.message = err.message || 'Transaction error';
  err.status = err.status || 500;

  if(next) {
    next(err)
    return {
      success: false,
      message: err.message
    }
  }
  else {
    throw err;
  }
}

module.exports = handleTransactionError;
