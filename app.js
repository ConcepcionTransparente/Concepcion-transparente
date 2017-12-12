var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Xray = require('x-ray');
var time = require('node-tictoc');
var mongoose = require('mongoose');
var model = require('./model/model');

// Throttle the requests to n requests per ms milliseconds.
var x = Xray().throttle(10, 1000);

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

// Scraper
var counter = 0;
function scraping() {
    console.log("START");
    var error = [];
    var url = "http://www.cdeluruguay.gob.ar/datagov/proveedoresContratados.php";

    x(url, 'body tr.textoTabla', [{
        year: 'td', //año
        total_amount: 'td:nth-of-type(4)', //importe de ese proveedor en ese año
        href: 'td:nth-of-type(8) a@href' //a@href a VER POR PROVEEDORES
    }])
    (function(err, wrapperObj) {
        wrapperObj.map(outerWrapperMap);
    });

    function outerWrapperMap(mappedObject) {
        x(mappedObject.href, 'body tr.textoTabla', [{
            cuil: 'td', //cuil proveedor
            grant_title: 'td:nth-of-type(2)', //nombre de fantasia del proveedor
            total_contrats: 'td:nth-of-type(4)', //cantidad de contrataciones en ese año
            href: 'td:nth-of-type(8) a@href' //a@href a VER POR RUBROS
        }])(function(err, wrapperObj) {
            if (wrapperObj == null) {
                error.push(wrapperObj);
            } else {
                wrapperObj.map(wrapperMap, {
                    year: mappedObject.year,
                    total_amount: mappedObject.total_amount
                });
            }
        });
    }

    function wrapperMap(mappedObject) {
        var parentObject = this;

        x(mappedObject.href, 'body tr.textoTabla', [{
            cod: 'td', //codigo del rubro
            category: 'td:nth-of-type(2)', //nombre del rubro
            href: 'td:nth-of-type(7) a@href' //a@href a MESES
        }])(function(err, innerWrapperObject) {
            if (innerWrapperObject == null) {
                error.push(innerWrapperObject);
            } else {
                innerWrapperObject.map(innerWrapperMap, {
                    provider: mappedObject,
                    year: parentObject.year,
                    total_amount: parentObject.total_amount
                });
            }
        });
    };

    function innerWrapperMap(mappedObject) {
        var parentObject = this;

        x(mappedObject.href, 'body tr.textoTabla', [{
            month: 'td', //mes
            numberOfContracts: 'td:nth-of-type(2)', //cantidad de contratos
            import: 'td:nth-of-type(4)' //importe para ese mes
        }])(function(err, finalObject) {
            if (finalObject == null) {
                error.push(finalObject);
            } else {
                finalObject.map(normalize, {
                    category: mappedObject,
                    provider: parentObject.provider,
                    year: parentObject.year,
                    total_amount: parentObject.total_amount
                });
            }
        });
    };

    function normalize(o) {
      console.log('counter');
      console.log(counter);

      counter = counter +1;
        var parentObject = this;
        var year = parseInt(parentObject.year); //año

        var childObject = {
            year: year, //year
            cuil: parentObject.provider.cuil, //proveedor
            grant_title: parentObject.provider.grant_title, //proveedor
            total_amount: parentObject.total_amount, //importe de ese proveedor en UN AÑO
            total_contrats: parentObject.provider.total_contrats, //cantidas de contrataciones en UN AÑO
            cod: parentObject.category.cod, //codigo del rubro
            category: parentObject.category.category, //nombre del rubro (reparticion)
            month: o.month, //mes
            numberOfContracts: o.numberOfContracts, //cantidad de contratos para ese mes
            import: o.import //importe en ese mes
        };

        // Cada linea del scraping cuenta con:
        // year-cuil-grant_title-cod-category-month-numberofcontracts-import
        // month string to month number
        function nuevoMes(m) {
            if (m == "Enero") {
                return 00;
            } else if (m == "Febrero") {
                return 01;
            } else if (m == "Marzo") {
                return 02;
            } else if (m == "Abril") {
                return 03;
            } else if (m == "Mayo") {
                return 04;
            } else if (m == "Junio") {
                return 05;
            } else if (m == "Julio") {
                return 06;
            } else if (m == "Agosto") {
                return 07;
            } else if (m == "Septiembre") {
                return 08;
            } else if (m == "Octubre") {
                return 09;
            } else if (m == "Noviembre") {
                return 10;
            } else if (m == "Diciembre") {
                return 11;
            } else {
                return 13;
            }
        }

        var monthNumber = nuevoMes(childObject.month);

        // Convert month and year in date
        function stringToDate(month, year) {
            // new Date(year, month, day, hours, minutes, seconds, milliseconds)
            var d = new Date(year, month, 01,00,00,00,00);
            d.toISOString().slice(0, 10);
            console.log("fecha: " + d);
            return d;
        }

        var newDate = stringToDate(monthNumber, childObject.year);
        year = parseInt(year);

        // Convert import to correct float number
        function nuevoImporte(m) {
            var y = m.replace(/\./g, '').replace(/\,/g, '.');
            y = parseFloat(y);
            return y;
        }

        var w = nuevoImporte(childObject.import);
        var z = nuevoImporte(childObject.total_amount);
        var partialImport = parseFloat(w); //importe de un proveedor en un cierto mes
        var totalImport = parseFloat(z); //importe total para el años correspondiente a esta fila

        var updateProvider = {
            cuil: childObject.cuil,
            grant_title: childObject.grant_title
        };

        var options = {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
        };

        mongoose
            .model('Provider')
            .findOneAndUpdate(
                {
                    cuil: childObject.cuil
                },
                updateProvider,
                options,
                function(err, result1) {
                    if (err) {
                        console.log(err);
                        return;
                    }

                    console.log("updateando provider");
                    console.log("result1:" + result1);

                    // Insercion de category
                    var updateCategory = {
                        cod: childObject.cod,
                        category: childObject.category
                    };
                    mongoose.model('Category').findOneAndUpdate({
                        // cod: childObject.cod,
                        category: childObject.category
                    }, updateCategory, options, function(err, result2) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        // console.log("result2" + result2);
                        // console.log("------------------------------------- RESULT1-ID: " + result1._id);
                        // console.log("------------------------------------- RESULT2-ID: " + result2._id);

                        //insercion de orden de compra
                        var Purchase = {
                            year: childObject.year,
                            month: monthNumber,
                            date: newDate,
                            numberOfContracts: childObject.numberOfContracts,
                            import: partialImport,
                            fk_Provider: result1._id,
                            fk_Category: result2._id
                        };
                        mongoose.model('PurchaseOrder').findOneAndUpdate({
                            year: childObject.year,
                            month: monthNumber,
                            date: newDate,
                            numberOfContracts: childObject.numberOfContracts,
                            import: partialImport,
                            fk_Provider: result1._id,
                            fk_Category: result2._id
                        }, Purchase, options, function(err, purchase) {
                            if (err) {
                                console.log("ERROR AL INSERTAR PURCHASE EN LA DATABASE: ");
                                console.log(err);
                                return;
                            }
                            console.log("NEW PURCHASE: " );
                            console.log(Purchase);
                        }); //END INSERT PURCHASE
                        // return;
                        // console.log("NEW CATEGORY: " + result2);

                    }); //END UPDATE CATEGORY
                    // return;
                    // console.log("NEW PROVIDER: " + result1);

                    // result.status(200).send(result);
                }
            );

        var updateYear = {
            year: childObject.year,
            total_contrats: childObject.total_contrats,
            totalAmount: totalImport
        };

        mongoose
            .model('Year')
            .findOneAndUpdate(
                {
                    year: childObject.year
                },
                updateYear,
                options,
                function(err, years) {
                    if (err) {
                        console.log(err);
                        return;
                    } else {
                        // console.log("NEW YEAR: " + years);
                    }
                }
            );
    };

    return;
};

// time.tic();
// scraping();
// time.toc();

var now = new Date();
var executeScraper = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 07, 30, 0, 0) - now;
if (executeScraper < 0) {
    executeScraper += 86400000; // Si se pasaron las 3.30 am que lo vuelva a ejecutar mañana a la misma hora
}
setTimeout(function() {
    // scraping();
}, executeScraper);

module.exports = app;
