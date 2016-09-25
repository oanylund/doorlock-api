var express = require('express');
var slotRoute = express.Router();

var models = require('doorlock-models');
var Slot = models.Slot;
var Product = models.Product;

var standardFilter = require('../helpers/standardFilter');
var generateError = require('../helpers/generateError');

slotRoute.get('/', function(req,res,next) {

  Slot.findAndCountAll(Object.assign({}, standardFilter(req.query), {
    attributes: ['id'],
    include: [{
      model: Product,
      attributes: ['description', 'retailPrice', 'costPrice']
    }]
  }))
    .then( function(rows) {
      res.json({ success: true, data: rows });
    })
    .catch( function(err) {
      next(generateError('Internal server error', 500));
    });

});

slotRoute.post('/add', function(req,res,next) {

  Slot.findOne({
    attributes: ['id'],
    order: [['id', 'DESC']],
  })
    .then( function(slotRight) {
      if(!slotRight) {
        return Slot.create({
          id: 1
        })
      }
      return Slot.create({
        id: slotRight.id + 1
      })
    })
    .then( function(newSlot) {
      res.json({ success: true, data: newSlot })
    })
    .catch( function(err) {
      next(generateError('Internal server error', 500));
    });

});

slotRoute.put('/setProduct/:slotId', function(req,res,next) {
  var slotId = req.params.slotId;
  var productId = req.body.productId;
  if( isNaN(slotId) || slotId === '') {
    return next(generateError('Wrong slotId or no slotId supplied', 400));
  }
  if( isNaN(productId) || productId === '') {
    return next(generateError('Wrong product id or no product id supplied', 400));
  }

  Slot.findById(slotId)
    .then( function(slot) {
      if(!slot) {
        throw generateError('No slot with id ' + slotId + ' exist', 400);
      }
      return slot.setProduct(productId);
    })
    .then( function(updatedSlot) {
      res.json({ success: true, data: updatedSlot });
    })
    .catch( function(err) {
      if(err.name === 'SequelizeForeignKeyConstraintError' && err.index === 'productId') {
        return next(generateError('No product with id ' + productId + ' exist', 400));
      }
      if(err.status) {
        return next(err);
      }
      next(generateError('Internal server error', 500));
    });

});

slotRoute.put('/unsetProduct/:slotId', function(req,res,next) {
  var slotId = req.params.slotId;
  if( isNaN(slotId) || slotId === '') {
    return next(generateError('Wrong slotId or no slotId supplied', 400));
  }

  Slot.findById(slotId)
    .then( function(slot) {
      return slot.setProduct(null);
    })
    .then( function(updatedSlot) {
      res.json({ success: true, data: updatedSlot });
    })
    .catch( function(err) {
      next(generateError('Internal server error', 500));
    });

});

slotRoute.delete('/delete', function(req,res,next) {

  Slot.findOne({
    attributes: ['id'],
    order: [['id', 'DESC']],
  })
    .then( function(slotRight) {
      if(!slotRight) {
        return 0;
      }
      return Slot.destroy({ where: { id: slotRight.id } })
    })
    .then( (affectedRows) => {
      if(affectedRows) {
        res.json({success: true, message: 'Slot deleted'});
      }
      else {
        next(generateError('No slots exist', 404));
      }
    })
    .catch( (err) => {
      next(generateError('Internal server error', 500));
    });

});

module.exports = slotRoute;
