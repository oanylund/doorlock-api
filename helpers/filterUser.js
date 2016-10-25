var Sequelize = require('doorlock-models').Sequelize;

var filterUser = function(query) {

  if (query.fullName) {
    return {
      where: Sequelize.where(
        Sequelize.fn(
          'concat',
          Sequelize.col('firstName'),
          ' ',
          Sequelize.col('lastName')
        ), {
          like: '%' + query.fullName + '%'
        }
      )
    }
  }

}

module.exports = filterUser;
