var express = require('express');
var transactionRoute = express.Router();

var models = require('doorlock-models');
var Transaction = models.Transaction;
var Product = models.Product;
var User = models.User;

var standardFilter = require('../helpers/standardFilter');
var filterTransaction = require('../helpers/filterTransaction');
var generateError = require('../helpers/generateError');

var purchaseTransaction = require('../helpers/transactions/purchaseTransaction');
var wdDpTransaction = require('../helpers/transactions/wdDpTransaction');

transactionRoute.get('/', function(req,res,next) {

  Transaction.findAndCountAll(Object.assign({},
    standardFilter(req.query),
    filterTransaction(req.query),
    { include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'userName']
      },
      {
        model: Product,
        attributes: ['id', 'description']
      }],
      attributes: {
        exclude: ['userId', 'productId']
      }
    }))
    .then( function(rows) {
      res.json({ success: true, data: rows });
    })
    .catch( function(err) {
      next(generateError('Internal server error', 500));
    });

});

transactionRoute.post('/create', function(req,res,next) {
  next(generateError('Missing /create/:type', 400));
});

transactionRoute.post('/create/:type', function(req,res,next) {

  var validTypes = ['deposit', 'purchase', 'withdrawal'];
  if( validTypes.indexOf(req.params.type) === -1) {
    return next(generateError('/create/:type should be one of \'deposit\'|\'withdrawal\'|\'purchase\'', 400));
  }
  if( isNaN(req.body.userId) ) {
    return next(generateError('Missing or invalid userId', 400));
  }

  if(req.params.type === 'purchase') {
    if( isNaN(req.body.slotId) ) {
      return next(generateError('Missing or invalid slotId', 400));
    }
    purchaseTransaction(req.body.userId, req.body.slotId)
      .then( function(result) {
        res.json(result);
      })
      .catch( function(err) {
        return next(err);
      });
  }
  else {
    if( isNaN(req.body.amount) ) {
      return next(generateError('Amount must be a number using dot as decimal mark', 400));
    }
    if(req.body.amount <= 0 ) {
      return next(generateError('Amount must be larger than zero', 400));
    }
    wdDpTransaction(req.body.userId, req.params.type, req.body.amount)
      .then( function(result) {
        res.json(result);
      })
      .catch( function(err) {
        return next(err);
      });
  }

});

module.exports = transactionRoute;
