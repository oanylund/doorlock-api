var handleDbValidationError = function(errors) {
  var validationErr = new Error('Validation error');
  validationErr.status = 400;
  validationErr.errors = errors.reduce( function(acc, err) {
    acc[err.path] = err.message;
    return acc;
  }, {})

  return validationErr;
}

module.exports = handleDbValidationError;
