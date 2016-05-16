var express = require('express');
var app = express();
var cors = require('cors');

var auth = require('./jwt-auth');
var userRoutes = require('./routes/user');

var bodyParser  = require('body-parser');
var morgan      = require('morgan');

var sequelize = require('doorlock-models').sequelize; // Local link. Also contains models

var port = process.env.PORT || 3000;

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
  console.log('DB synced.');
  app.listen(port, () => {
    console.log('API server listening on port %d', port);
  });
});
