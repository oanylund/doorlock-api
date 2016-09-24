var generateError = require('./generateError');
var handleDbValidationError = require('./handleDbValidationError');

var handleProductError = function(err, next) {
  var newErr;
  switch (err.name) {
    case 'SequelizeValidationError':
      var newErr = handleDbValidationError(err.errors);
      break;
    default:
      var genErr = generateError('Internal server error', 500);
  }
  next(newErr);
}


module.exports = handleProductError;
