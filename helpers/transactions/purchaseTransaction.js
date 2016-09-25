var generateError = require('../generateError');
var handleTransactionError = require('./handleTransactionError');

var models = require('doorlock-models');
var User = models.User;
var Slot = models.Slot;
var Product = models.Product;
var ProductDetail = models.ProductDetail;
var sequelize = models.sequelize;

var purchaseTransaction = function(userId, slotId, next) {
  // Find user if exists
  return User.findById(userId)
    .then( function(customer) {
      if(customer) return customer;
      throw generateError('User does not exist', 404);
    })
    // Find product linked to slot
    .then( function(customer) {
      return Slot.findById(slotId, {
        include: [{
          model: Product,
          include: [ProductDetail]
        }]
      })
        .then( function(slotWithProduct) {
          // Check if slotnumber is valid
          if(!slotWithProduct) {
            throw generateError('Slot number is invalid', 404)
          }
          // Check if slot is linked to product
          if(!slotWithProduct.product) {
            throw generateError('No product linked to this slot', 404);
          }
          // Check if customer has enough money to buy product
          if(customer.balance < slotWithProduct.product.retailPrice) {
            throw generateError('User has insufficient funds', 401);
          }
          return { customer, product: slotWithProduct.product }
        })
    })
    .then( function(instances) {
      var customer = instances.customer;
      var product = instances.product;

      // Start transaction with automatic rollback on error
      return sequelize.transaction( function(t) {
        // Create new transaction row
        return customer.createTransaction({
          type: 'purchase',
          amount: -product.retailPrice,
          oldBalance: customer.balance
        }, {transaction:t})
          // Set the new transactions product assosiation
          .then( function(newTransaction) {
            return newTransaction.setProduct(product, {transaction:t})
          })
          // Update product details
          .then( function() {
            var prodDet = product.productDetail;
            return prodDet.increment({
              productEarnings: product.retailPrice,
              unitsSold: 1
            }, {transaction:t})
          })
          // Update customers balance
          .then( function() {
            return customer.decrement({
              balance: product.retailPrice
            }, {transaction:t})
          })
      })
      // Return success data to caller
      .then( function() {
        return {
          success: true,
          data: {
            userId: customer.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            newBalance: customer.balance - product.retailPrice
          }
        }
      })
    })
    .catch( function(err) {
      handleTransactionError(err,next);
    })
}

module.exports = purchaseTransaction;
