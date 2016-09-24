var filterUser = function(query) {

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

  var where = {}
  if (query.firstName) {
    where = Object.assign(where, {
      firstName: {
        $like: '%' + query.firstName + '%'
      }
    });
  }
  if (query.lastName) {
    where = Object.assign(where, {
      lastName: {
        $like: '%' + query.lastName + '%'
      }
    });
  }

  filter.where = where;

  return filter;
}

module.exports = filterUser;
