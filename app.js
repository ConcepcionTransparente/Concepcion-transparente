// ExpressJS

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var model = require('./model/model');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// Mongo DB
var mongoose = require('mongoose');
var colors = require('colors')
require('dotenv').config()

// try {
//   let host = process.env.MONGO_HOST || 'localhost'
//   let port = process.env.MONGO_PORT || '27017'
//   let db = process.env.MONGO_DB || 'grapql-exmaple'
//   let mdbUri = 'mongodb://'
//
//   mdbUri = mdbUri + host + ':' + port + '/' + db
//   console.log(colors.green.underline("MONGODB URI"))
//   console.log(colors.green(">> ") + mdbUri)
//   mongoose.Promise = global.Promise
//   app.connection = mongoose.connect(mdbUri)
// } catch (error) {
//   console.log(colors.green.underline("MONGO CONNECTION ERROR"))
//   console.log(colors.green(">> ") + JSON.stringify(error))
// }

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/public'));

app.set('views', __dirname + '/views');
// app.engine('html', require('ejs').renderFile);
// app.set('view engine', 'html');
// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

// app.use(express.static(__dirname + '/public'));
// app.set('views', __dirname + '/views');
// app.engine('html', require('ejs').renderFile);
// app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// Development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
