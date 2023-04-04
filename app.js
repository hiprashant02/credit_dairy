var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var app = express()
const expressWs = require('express-ws');
const wsInstance = expressWs(app);

// Handle new WebSocket connections
app.ws('/supplier/:userId', (ws, req) => {
  // Store the WebSocket connection in the clients map
  const { userId } = req.params;
  clientMap.set(userId, ws);

  // Remove the WebSocket connection from the clients map when it closes
  ws.on('close', () => {
    clientMap.delete(userId);
  });
});

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var peopleRouter = require('./routes/people');
var transactionRouter = require('./routes/transaction');


const sequelize = require('./database/sequelize')


// Importing the user model
const User = require('./models/user')
const People = require('./models/people')
const Transaction = require('./models/transaction')


const verifyToken = require('./utils/jwt_utils');
const clientMap = require('./clientMap');

sequelize.sync();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  if (req.path== "/user/authenticate" || req.path== "/user/verify-otp") {
    // Skip the middleware for the authentication routes
    next();
  } else {
    // Use the middleware for all other routes
    verifyToken(req, res, next);
  }
});

// app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/people', peopleRouter);
app.use('/transaction', transactionRouter);




// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status||500).json(err.message);
});

app.listen(3030, () => {
  console.log(`Example app listening on port ${8080}`)
})