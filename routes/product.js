var express = require('express');
var productRoute = express.Router();

var models = require('doorlock-models');
var Product = models.Product;
var ProductDetail = models.ProductDetail;

var standardFilter = require('../helpers/standardFilter');
var handleProductError = require('../helpers/handleProductError');
var generateError = require('../helpers/generateError');

productRoute.get('/', function(req,res,next) {

  Product.findAndCountAll(Object.assign({}, standardFilter(req.query), {
    include: [{
      model: ProductDetail,
      attributes: ['productEarnings', 'unitsSold']
    }]
  }))
    .then( function(rows) {
      res.json({ success: true, data: rows });
    })
    .catch( function(err) {
      next(generateError('Internal server error', 500));
    });

});

productRoute.get('/findByID/:id', function(req,res,next) {
  if( !req.params.id ) {
    next(generateError('No product id supplied', 400));
  }
  else {
    Product.findOne({
      where: { id: req.params.id },
      include: [{
        model: ProductDetail,
        attributes: ['productEarnings', 'unitsSold']
      }]
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

productRoute.post('/add', function(req, res, next) {

  Product.create({
    description: req.body.description,
    retailPrice: req.body.retailPrice,
    costPrice: req.body.costPrice,
    productDetail: {
      productEarnings: 0,
      unitsSold: 0
    }
  }, {
    include: [ProductDetail]
  })
    .then( function(row) {
      res.json({success: true, data: row});
    })
    .catch( function(err) {
      handleProductError(err,next) });

});

productRoute.put('/edit/:id', function(req, res, next) {

  Product.update(req.body, {
    where: { id: req.params.id }
  })
    .then( (affectedRows) => {
      if(affectedRows) {
        res.json({success: true, message: 'Product updated'})
      }
      else {
        next(generateError('Product not found', 404));
      }
    })
    .catch( (err) => { handleProductError(err,next) });

});

productRoute.delete('/delete/:id', function(req, res, next) {

  Product.destroy({where: { id: req.params.id } })
    .then( (affectedRows) => {
      if(affectedRows) {
        res.json({success: true, message: 'Product deleted'});
      }
      else {
        next(generateError('Product not found', 404));
      }
    })
    .catch( (err) => {
      next(generateError('Internal server error', 500));
    });

});

module.exports = productRoute;
