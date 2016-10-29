var generateError = require('./generateError');

var standardFilter = function(query) {

  if(query.limit && isNaN(query.limit)) throw generateError('Limit is not a number', 400);
  if(query.offset && isNaN(query.offset)) throw generateError('Offset is not a number', 400);
  if(query.order && (query.order !== 'ASC' || query.order !== 'DESC')) {
    throw generateError('Order should be one of \'ASC\'|\'DESC\'', 400);
  }

  var filter = {}
  var orderDirection = query.order || 'ASC';
  var orderBy = query.orderBy || 'id';
  var orderFirst = [];
  var order = [];
  orderFirst.push(orderBy,orderDirection);
  order.push(orderFirst);
  filter.order = order;
  if (query.limit) { filter.limit = +query.limit }
  if (query.offset) { filter.offset = +query.offset }

  return filter;
}

module.exports = standardFilter;
