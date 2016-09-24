var handleUserError = function(err, next) {
  var newErr;
  switch (err.name) {
    case 'SequelizeUniqueConstraintError':
      newErr = new Error('Student card already in use');
      newErr.status = 400;
      break;
    case 'SequelizeValidationError':
      var newErr = new Error('Validation error');
      newErr.status = 400;
      break;
    default:
      var genErr = new Error('Internal server error')); // return 500
  }
  next(newErr);
}


module.exports = handleUserError;
