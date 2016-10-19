var generateError = require('./generateError');
var handleDbValidationError = require('./handleDbValidationError');

var handleUserError = function(err, next) {

  switch (err.name) {
    case 'SequelizeUniqueConstraintError':
      return next(generateError('Student card already in use', 400));
    case 'SequelizeValidationError':
      return next(handleDbValidationError(err.errors));
    default:
      return next(generateError('Internal server error', 500));
  }

}


module.exports = handleUserError;
