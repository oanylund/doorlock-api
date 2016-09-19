var express = require('express');
var app = express();
var cors = require('cors');

// Fetch local db environment vars from .env
require('dotenv').config();

var auth = require('./jwt-auth');
var userRoutes = require('./routes/user');

var bodyParser  = require('body-parser');
var morgan      = require('morgan');

var sequelize = require('doorlock-models')
  .sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD);

var port = process.env.PORT || 3000;

var logger = function(msg) {
  console.log('--------------------------------------------');
  console.log(msg);
  console.log(new Date());
}

logger('App started');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

if (app.get('env') === 'development') {
  app.use(morgan('dev')); // If in dev mode, log request to console
}

var api = express.Router();

//Handle preflight CORS requests
api.options('*',cors());

//Set general api headers
api.use( (req,res,next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Accept,Content-Type,X-Requested-With,x-access-token");
  next();
})

// Index, api docs.
// Not authenticated.
api.get('/', function(req,res) {
  res.json({
    homepage: 'here'
  });
});

// Authenticate api requests with jason web tokens.
api.use(auth);

// Api routes
api.use('/user', userRoutes);

app.use('/', api);

// 404 handler
app.use('*', (req,res,next) => {
  var err = new Error('Not a valid endpoint. See docs at /api root')
  err.status = 404;
  next(err);
});

// Error handling
app.use( (err, req, res, next) => {
  err.message = err.message || 'Error'
  res.status(err.status || 500);
  res.json({ message: err.message });
});

sequelize.sync().then(function() {
  logger('DB synced')
  app.listen(port, () => {
    logger('API server listening on port ' + port);
  });
});
