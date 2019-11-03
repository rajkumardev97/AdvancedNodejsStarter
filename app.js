const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport"); 
const expressValidator = require("express-validator");
const createError = require('http-errors'); 
var cookieParser = require("cookie-parser");
const path = require("path"); 
const config = require('./config/config')
var indexRouter = require('./routes/index');
const Agenda = require('agenda');
const Agendash = require('agendash');
const agenda = new Agenda({
  db: { address: config.db.master},
  maxConcurrency: 5,
  defaultConcurrency: 1
});


const app = express();

logger = require('./utils/logger')
  
  
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


// Morgan: is another HTTP request logger middleware for Node.js. It simplifies the process of logging requests to your application. You might think of Morgan as a helper that collects logs from your server, such as your request logs. It saves developers time because they don’t have to manually create common logs. It standardizes and automatically creates request logs.
// Morgan can operate standalone, but commonly it’s used in combination with Winston. Winston is able to transport logs to an external location, or query them when analyzing a problem.
app.use(require("morgan")(function (tokens, req, res) {
  let ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
  let accessToken = `accessToken:-${(req.headers['authorization']+"")}`
  return [
    req.user && req.user._id,
    ip,accessToken,
    tokens['remote-user'](req,res),
    tokens.date(req, res, 'clf'),
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['referrer'](req, res),
    tokens['user-agent'](req, res),
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
}, { "stream": logger.stream }));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); 

var publicDir = require("path").join(__dirname, "public");
app.use(express.static(publicDir));

app.options("*", function (req, res, next) { 
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type,Authorization, Accept");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS ,PATCH");
  res.status(200).end();
});
app.use(function (req, res, next) { 
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("X-Frame-Options","DENY");
  next();
});
   
// Use Routes
app.use('/api', indexRouter);

app.use('/agenda-dashboard',Agendash(agenda))

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
