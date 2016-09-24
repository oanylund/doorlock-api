var generateError = function(errMessage, errStatus) {
  var error = new Error(errMessage);
  error.status = 500 || errStatus;
  return error;
}

module.exports = generateError;
