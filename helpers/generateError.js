var generateError = function(errMessage, errStatus) {
  var error = new Error(errMessage);
  error.status = errStatus || 500;
  return error;
}

module.exports = generateError;
