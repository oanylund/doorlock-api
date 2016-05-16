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

userRoute.post('/add', function(req, res, next) {
  User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    userName: req.body.userName,
    privateEmail: req.body.privateEmail,
    mobile: req.body.mobile,
    studentCardId: req.body.studentCardId
  })
  .then( function(row) {
    res.json({success: true, data: row});
  })
  .catch( function(err) {
    switch (err.name) {
      case 'SequelizeUniqueConstraintError':
        var UniqueConstraintError = new Error('Student card already in use');
        UniqueConstraintError.status = 400;
        next(UniqueConstraintError);
        break;
      case 'SequelizeValidationError':
        var validationError = new Error('Validation error');
        validationError.status = 400;
        next(validationError);
        break;
      default:
        next(new Error('Internal server error')); // return 500
    }
  });
});

userRoute.put('/edit/:id', function(req, res, next) {

  User.update(req.body,
  {
    where: { id: req.params.id }
  }).then( (affectedRows) => {
    if(affectedRows) {
      res.json({success: true, message: 'Member updated'})
    }
    else {
      var notFound = new Error('Member not found');
      notFound.status = 404;
      next(notFound);
    }
  }).catch( (err) => {
    console.log(err);
    if (err.name === 'SequelizeValidationError') {
      var validationError = new Error('Validation error');
      validationError.status = 400;
      next(validationError);
    }
    else {
      next(new Error('Internal server error')); // return 500
    }
  });

});

userRoute.delete('/delete/:id', function(req, res, next) {

  User.destroy({where: { id: req.params.id } }).then( (affectedRows) => {
    if(affectedRows) {
      res.json({success: true, msg: 'Member deleted'});
    }
    else {
      var notFound = new Error('Member not found');
      notFound.status = 404;
      next(notFound);
    }
  }).catch( (err) => {
    next(new Error('Internal server error')); // return 500
  });

});


module.exports = userRoute;
