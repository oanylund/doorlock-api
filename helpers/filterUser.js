var filterUser = function(query) {

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

  return {
    where: where
  };
}

module.exports = filterUser;
