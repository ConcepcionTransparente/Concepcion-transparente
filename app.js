var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Xray = require('x-ray');
var time = require('node-tictoc');
var mongoose = require('mongoose');
var db = require('./model/db');
var model = require('./model/model');

var x = Xray({
    filters: {
        nocomma: function(value) {
            return typeof value === 'string' ? value.split(',')[0] : value
        },
        nopoint: function(value) {
            return typeof value === 'string' ? value.replace(/\./g, '') : value
        }
    }
});

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




/////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////SCRAPER////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

function yearProvider() {
    var date = new Date();
   for (i = 2009; i <= date.getFullYear(); i++) {

    var error_innerWrapperObject = [];
    var error_finalObject = [];
    console.log('Year ' + i);

    var url = "http://www.cdeluruguay.gov.ar/datagov/proveedoresContratadosAP.php?anio=" + i;
    x(url, 'body tr.textoTabla', [{
            cuil: 'td',
            grant_title: 'td:nth-of-type(2)',
            total_amount: 'td:nth-of-type(6) | nopoint | nocomma',
            total_contrats: 'td:nth-of-type(4) | nopoint',
            href: 'td:nth-of-type(8) a@href' //a@href a RUBROS
        }])
        (function(err, wrapperObj,i) {
            // console.log('wrapperObj ' + JSON.stringify(wrapperObj));
            wrapperObj.map(wrapperMap, wrapperObj);
            console.log("------ANIO: ------"+i);
        });
     } //end/ for////////////////////////////////////////////////////////////////////

    function wrapperMap(mappedObject) {
        var parentObject = this;
        x(mappedObject.href, 'body tr.textoTabla', [{
            cod: 'td',
            category: 'td:nth-of-type(2)',
            href: 'td:nth-of-type(7) a@href' //a@href a MESES
        }])(function(err, innerWrapperObject) {
            // console.log('innerWrapperObject ' + JSON.stringify(innerWrapperObject));
            if (innerWrapperObject == null) {
                error_innerWrapperObject.push(innerWrapperObject);
            } else {
                innerWrapperObject.map(innerWrapperMap, {
                    provider: mappedObject
                });
            }
        })
    };

    function innerWrapperMap(innerMappedObject) {
        var parentObject = this;
        x(innerMappedObject.href, 'body tr.textoTabla', [{
            month: 'td',
            numberOfContracts: 'td:nth-of-type(2)',
            import: 'td:nth-of-type(4)'
        }])(function(err, finalObject) {
            // console.log('finalObject ' + JSON.stringify(finalObject));
            if (finalObject == null) {
                error_finalObject.push(finalObject);
            } else {
            finalObject.map(normalize, {
                category: innerMappedObject,
                provider: parentObject.provider
            });
          }

        })
    };

    function normalize(o) {
        var parentObject = this;
        // var childObject = {
        //     amount: o,
        //     category: parentObject.category,
        //     provider: parentObject.provider
        // }
        var childObject = {
            year: parentObject.provider.year, //year proveedor
            cuil: parentObject.provider.cuil, //proveedor
            grant_title: parentObject.provider.grant_title, //proveedor
            total_amount: parentObject.provider.total_amount, //por ahora no sirve, se puede calcular
            total_contrats: parentObject.provider.total_contrats, //por ahora no sirve, se puede calcular
            cod: parentObject.category.cod, //rubro
            category: parentObject.category.category, //rubro (reparticion)
            month: o.month, //mes
            numberOfContracts: o.numberOfContracts,
            import: o.import //importe TRANSFORMAR A NUMBER
        };

        console.log("ANIO: ---->"+childObject.year);
        console.log(JSON.stringify(childObject));
        console.log("---------------------------------------------------------");
        ////////////////////////////////////////////////////////////////////////
        ////////////////////////////mongoose////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////

        //PROVIDER//////////////////////////////////////////////////////////////
        var update = { cuil: childObject.cuil,grant_title:childObject.grant_title },
            options = { upsert: true, new: true, setDefaultsOnInsert: true };

        // Find the document
        mongoose.model('Provider').findOneAndUpdate({cuil:childObject.cuil}, update, options, function(error, result) {
            if (error) return;
            console.log("UPDATEANDO PROVIDER -------------------------------------------");
            return;
            result.status(200).send(result);
        });

        // //CATEGORY /////////////////////////////////////////////////////////////
        update = { cod: childObject.cod,category:childObject.category },
        options = { upsert: true, new: true, setDefaultsOnInsert: true };

        // Find the document
        mongoose.model('Category').findOneAndUpdate({cod:childObject.cod,category:childObject.category}, update, options, function(error, result) {
            if (error) return;
            console.log("UPDATEANDO CATEGORY *******************************************");
            return;
        });

        // //PURCHASE-ORDER////////////////////////////////////////////////////////
        var obj={
          year: childObject.year,
          month: childObject.month,
          numberOfContracts: childObject.numberOfContracts,
          import: childObject.import,
          cuil: childObject.cuil, //cambiar por fk_Provider
          category: childObject.category //cambiar por fk_Category
        }
        mongoose.model('PurchaseOrder').create(obj,function(err,purchase){
          if(err){return console.log(err);}
          return console.log("NUEVA INSERCION: "+ purchase);

        });

    }; //end normalize
}; //end yearProvider////////////////////////////////////////////////////////////////////

time.tic();
yearProvider();
time.toc();



///////////////////////////////////////////////////////////////////////////////////
////////////////////////////////SCRAPER////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

// Reporte: Proveedores Contratados (por año)
function year(val){
  var url='http://www.cdeluruguay.gov.ar/datagov/proveedoresContratados.php';
  x( url , 'body tr.textoTabla', [{
          year: 'td',
          numberOfContracts: 'td:nth-of-type(2)',
          totalAmount: 'td:nth-of-type(4) | nopoint | nocomma'
      }])
      .write('public/jsons/year/years.json');
};

time.tic();
 for (var i = 0; i < 1; i++) {
     year(i);
 }
time.toc();










module.exports = app;
