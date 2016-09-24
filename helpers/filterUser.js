var filterUser = function(query, standardFilter) {

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

  return Object.assign({},standardFilter , where);
}

module.exports = filterUser;
