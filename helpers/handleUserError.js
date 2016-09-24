var generateError = require('./generateError');
var handleDbValidationError = require('./handleDbValidationError');

var handleUserError = function(err, next) {
  var newErr;
  switch (err.name) {
    case 'SequelizeUniqueConstraintError':
      newErr = generateError('Student card already in use', 400);
      break;
    case 'SequelizeValidationError':
      var newErr = handleDbValidationError(err.errors);
      break;
    default:
      var genErr = generateError('Internal server error', 500);
  }
  next(newErr);
}


module.exports = handleUserError;
