var express = require('express');
var userRoute = express.Router();

var models = require('doorlock-models'); // Local link
var User = models.User;

function requestFilter(query) {

  var filter = {}
  var orderDirection = query.order || 'ASC'
  var orderBy = query.orderBy || 'id'
  var orderFirst = []
  var order = []
  orderFirst.push(orderBy,orderDirection)
  order.push(orderFirst)
  filter.order = order
  if (query.limit) { filter.limit = +query.limit }
  if (query.offset) { filter.offset = +query.offset }

  return filter
}

userRoute.get('/', function(req,res,next) {

  User.findAll(requestFilter(req.query))
  .then(function(rows) {
    res.json({ success: true, data: rows });
  })
  .catch( function(err) {
    var getError = new Error('Internal server error');
    next(getError);
  });

});


userRoute.get('/findByID/:studentId', function(req,res,next) {
  if( !req.params.studentId ) {
    var noId = new Error('No student id supplied');
    noId.status = 400;
    next(noId);
  }
  else {
    User.findOne({
      where: { studentCardId: req.params.studentId },
      attributes: ['firstName', 'lastName', 'userName']
    })
    .then(function(user) {
      res.json({
        success: true,
        data: user
      });
    })
    .catch( function(err) {
      var getError = new Error('Internal server error');
      next(getError);
    });
  }
});

module.exports = userRoute;
