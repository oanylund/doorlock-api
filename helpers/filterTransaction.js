var generateError = require('./generateError');

var filterTransaction = function(query) {
  if(query.type && (query.type !== 'deposit' && query.type !== 'withdrawal' && query.type !== 'purchase')) {
    throw generateError('Type should be one of \'deposit\'|\'withdrawal\'|\'purchase\'', 400);
  }
  if(query.userId && isNaN(query.userId)) {
    throw generateError('UserId is not valid', 400);
  }

  var where = {}
  if (query.type) {
    where = Object.assign(where, {
      type: query.type
    });
  }
  if(query.userId) {
    where = Object.assign(where, {
      userId: query.userId
    })
  }

  return {
    where: where
  }
}

module.exports = filterTransaction;
