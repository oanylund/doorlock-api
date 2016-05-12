var express = require('express');
var userRoute = express.Router();

var models = require('doorlock-models'); // Local link
var User = models.User;

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
    }).then(function(user) {
      res.json({
        success: true,
        data: user
      });
    });
  }
});

module.exports = userRoute;
