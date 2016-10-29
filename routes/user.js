var express = require('express');
var userRoute = express.Router();

var models = require('doorlock-models');
var User = models.User;

var standardFilter = require('../helpers/standardFilter');
var filterUser = require('../helpers/filterUser');
var handleUserError = require('../helpers/handleUserError');
var generateError = require('../helpers/generateError');

userRoute.get('/', function(req,res,next) {

  User.findAndCountAll(Object.assign({}, filterUser(req.query), standardFilter(req.query)))
    .then( function(rows) {
      res.json({ success: true, data: rows });
    })
    .catch( function(err) {
      next(generateError('Internal server error', 500));
    });

});

userRoute.get('/findByID/:id', function(req,res,next) {
  if( !req.params.id ) {
    next(generateError('No student id supplied', 400));
  }
  else {
    User.findOne({
      where: { id: req.params.id }
    })
      .then(function(user) {
        res.json({
          success: true,
          data: user
        });
      })
      .catch( function(err) {
        next(generateError('Internal server error', 500));
      });
  }
});

userRoute.post('/add', function(req, res, next) {

  User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    userName: req.body.userName,
    graduationYear: req.body.graduationYear,
    privateEmail: req.body.privateEmail,
    mobile: req.body.mobile,
    studentCardId: req.body.studentCardId
  })
    .then( function(row) {
      res.json({success: true, data: row});
    })
    .catch( function(err) { handleUserError(err,next) });

});

userRoute.put('/edit/:id', function(req, res, next) {

  User.update(req.body,
  {
    where: { id: req.params.id }
  })
    .then( (affectedRows) => {
      if(affectedRows) {
        res.json({success: true, message: 'Member updated'})
      }
      else {
        next(generateError('Member not found', 404));
      }
    })
    .catch( (err) => { handleUserError(err,next) });

});

userRoute.delete('/delete/:id', function(req, res, next) {

  User.destroy({where: { id: req.params.id } })
    .then( (affectedRows) => {
      if(affectedRows) {
        res.json({success: true, message: 'Member deleted'});
      }
      else {
        next(generateError('Member not found', 404));
      }
    })
    .catch( (err) => {
      next(generateError('Internal server error', 500));
    });

});


module.exports = userRoute;
