var generateError = require('../generateError');
var handleTransactionError = require('./handleTransactionError');

var models = require('doorlock-models');
var User = models.User;
var sequelize = models.sequelize;

// withdrawal deposit transaction helper
var wdDpTransaction = function(userId, transactionType, amount, next) {
  var IncDec = transactionType === 'deposit' ? 'increment' : 'decrement';
  var plusMinus = transactionType === 'deposit' ? 1 : -1;

  // Find user
  return User.findById(userId)
    .then( function(customer) {
      if(customer) return customer;
      throw generateError('User does not exist', 404);
    })
    .then( function(customer) {
      if(transactionType !== 'deposit' && transactionType !== 'withdrawal') {
        throw generateError('Wrong transaction type', 400);
      }
      if(transactionType === 'withdrawal' && customer.balance < amount) {
        throw generateError('User has insufficient funds', 401);
      }
      return customer;
    })
    // Start transaction
    .then( function(customer) {
      var oldBalance = customer.balance;
      return sequelize.transaction( function(t) {
          // Update balance of customer
          return customer[IncDec]({
            balance: amount
          }, {transaction:t})
          // Create new transaction
          .then( function() {
            return customer.createTransaction({
              type: transactionType,
              amount: plusMinus*amount,
              oldBalance: oldBalance
            }, {transaction:t})
          })
      })
      .then( function(newTransaction) {
        return { customer, transaction: newTransaction }
      })
    })
    .then( function(newData) {
      return {
        success: true,
        data: {
          userId: newData.customer.id,
          firstName: newData.customer.firstName,
          lastName: newData.customer.lastName,
          newBalance: newData.customer.balance + newData.transaction.amount
        }
      }
    })
    .catch( function(err) {
      handleTransactionError(err,next);
    });
}

module.exports = wdDpTransaction;
