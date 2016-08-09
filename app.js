var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Xray = require('x-ray');
var x = Xray();
var time = require('node-tictoc');


var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
 app.set('views', path.join(__dirname, 'views'));
 app.set('view engine', 'jade');
//
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
app.use(bodyParser.urlencoded({ extended: false }));
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

// development error handler
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

//Scraping
//2016/proveedor
var url='http://www.cdeluruguay.gov.ar/datagov/proveedoresContratadosAP.php?anio=2016';

function xrayfunction(val) {
    // console.log("Iteracion "+ val);
    x( url , 'body tr.textoTabla', [{
            name: 'td',
            SocialR: 'td:nth-of-type(1)',
            price: 'td:nth-of-type(6)'
        }])(function() {
            console.log(val);
        })
        .write('public/results_' + val + '.json');

}

//Midiendo el tiempo, hay que llevar el scrap a un controller
  time.tic();
     for (var i = 0; i < 1; i++) {
         xrayfunction(i);
     }
  time.toc();





module.exports = app;
