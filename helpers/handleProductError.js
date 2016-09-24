var generateError = require('./generateError');

var handleProductError = function(err, next) {
  var newErr;
  switch (err.name) {
    case 'SequelizeValidationError':
      var newErr = generateError('Validation error', 400);
      break;
    default:
      var genErr = generateError('Internal server error', 500);
  }
  next(newErr);
}


module.exports = handleProductError;
