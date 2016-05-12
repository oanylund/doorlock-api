var express = require('express');
var app = express();
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // Contains secret and login info

var auth = express.Router();

auth.post('/authenticate', function(req,res,next) {

  if ( config.loginInfo.username !== req.body.username ) {
    var authUserFail = new Error('Authentication failed. User not found');
    authUserFail.status = 400;
    next(authUserFail);
  }
  else {
    if( config.loginInfo.userpass !== req.body.userpass ) {
      var authPasswordFail = new Error('Authentication failed. Password not found');
      authPasswordFail.status = 400;
      next(authPasswordFail);
    }
    else {
      var token = jwt.sign(config.loginInfo, config.secret, {
        expiresIn: '24h' // expires in 24 hours
      });

      res.json({
        success: true,
        message: 'Token delivered',
        token: token
      });

    }
  }
});

auth.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, config.secret, function(err, decoded) {
      if (err) {
        if(err.name === 'TokenExpiredError') {
          var tokenExired = new Error('Token expired');
          tokenExired.status = 401;
          next(tokenExired);
        }
        else {
          var tokenFailed = new Error('Failed to authenticate token');
          tokenFailed.status = 403;
          next(tokenFailed);
        }
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });

  } else {

    // if there is no token, return an error
    var noToken = new Error('No token provided');
    noToken.status = 401;
    next(noToken);

  }
});

app.use('/', auth);

module.exports = app;
