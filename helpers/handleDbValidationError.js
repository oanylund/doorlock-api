var handleDbValidationError = function(errors) {
  var validationErr = new Error('Validation error');
  validationErr.status = 400;
  validationErr.errors = errors.map( function(errorObj) {
    return {
      field: errorObj.path,
      type: errorObj.message
    }
  })
  return validationErr;
}

module.exports = handleDbValidationError;
