var standardFilter = function(query) {

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
