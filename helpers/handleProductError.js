var generateError = require('./generateError');
var handleDbValidationError = require('./handleDbValidationError');

var handleProductError = function(err, next) {

  switch (err.name) {
    case 'SequelizeValidationError':
      return next(handleDbValidationError(err.errors));
    default:
      return next(generateError('Internal server error', 500));
  }

}


module.exports = handleProductError;
