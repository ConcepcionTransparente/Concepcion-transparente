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
}).throttle(100,1000);

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

function scraping() {
    var error = [];
    var url = "http://www.cdeluruguay.gov.ar/datagov/proveedoresContratados.php";
    x(url, 'body tr.textoTabla', [{
            year: 'td', //año
            href: 'td:nth-of-type(8) a@href' //a@href a VER POR PROVEEDORES
        }])
        (function(err, wrapperObj) {
            wrapperObj.map(outerWrapperMap);
        });

    function outerWrapperMap(mappedObject) {
        x(mappedObject.href, 'body tr.textoTabla', [{
            cuil: 'td', //cuil proveedor
            grant_title: 'td:nth-of-type(2)', //nombre de fantasia del proveedor
            total_amount: 'td:nth-of-type(6)', //importe de ese proveedor en ese año
            total_contrats: 'td:nth-of-type(4) | nopoint', //cantidad de contrataciones en ese año
            href: 'td:nth-of-type(8) a@href' //a@href a VER POR RUBROS
        }])(function(err, wrapperObj) {
            if (wrapperObj == null) {
                error.push(wrapperObj);
            } else {
                wrapperObj.map(wrapperMap, {
                    year: mappedObject.year
                });
            }
        })
    }

    function wrapperMap(mappedObject) {
        // console.log(mappedObject);
        var parentObject = this;
        x(mappedObject.href, 'body tr.textoTabla', [{
            cod: 'td', //codigo del rubro
            category: 'td:nth-of-type(2)', //nombre del rubro
            href: 'td:nth-of-type(7) a@href' //a@href a MESES
        }])(function(err, innerWrapperObject) {
            // console.log('innerWrapperObject ' + JSON.stringify(innerWrapperObject));
            if (innerWrapperObject == null) {
                error.push(innerWrapperObject);
            } else {
                innerWrapperObject.map(innerWrapperMap, {
                    provider: mappedObject,
                    year: parentObject.year
                });
            }
        })
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
                    year: parentObject.year
                });
            }
        })
    };

    function normalize(o) {
        var parentObject = this;
        var year= parseInt(parentObject.year); //ño

        var childObject = {
            year: year, //year
            cuil: parentObject.provider.cuil, //proveedor
            grant_title: parentObject.provider.grant_title, //proveedor
            total_amount: parentObject.provider.total_amount, //importe de ese proveedor en UN AÑO
            total_contrats: parentObject.provider.total_contrats, //cantidas de contrataciones en UN AÑO
            cod: parentObject.category.cod, //codigo del rubro
            category: parentObject.category.category, //nombre del rubro (reparticion)
            month: o.month, //mes
            numberOfContracts: o.numberOfContracts, //cantidad de contratos para ese mes
            import: o.import //importe en ese mes
        };

        ///////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////
        //CADA LINEA DEL SCRAPING CUENTA CON:
        //YEAR-CUIL-GRANT_TITLE-COD-CATEGORY-MONTH-NUMBEROFCONTRACTS-IMPORT
        ///////////////////////////////////////////////////////////////////

        ///////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////
        //MONTH STRING TO MONTH NUMBER
        function nuevoMes(m){
          if(m == "Enero"){ return 1;}
          else if (m == "Febrero") { return 2;}
          else if (m == "Marzo") { return 3;}
          else if (m == "Abril") { return 4;}
          else if (m == "Mayo") { return 5;}
          else if (m == "Junio") { return 6;}
          else if (m == "Julio") { return 7;}
          else if (m == "Agosto") { return 8;}
          else if (m == "Septiembre") { return 9;}
          else if (m == "Octubre") { return 10;}
          else if (m == "Noviembre") { return 11;}
          else if (m == "Diciembre") { return 12;}
          else  { return 13;}
        }
        var monthNumber = nuevoMes(childObject.month);
        //  console.log("MESSSS STRING: ---> "+ childObject.month);
        //  console.log("MESSSS NUMBER: ---> "+ monthNumber);

        ///////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////
        //CONVERT IMPORT TO CORRECT FLOAT NUMBER
        function nuevoImporte(m){
          // console.log("NUMERO DEL SCRAPER ---> "+m);
          var y = m.replace(/\./g,'').replace(/\,/g,'.');
          // console.log("NUMERO CONVERTIDO PERO STRING ---> " + y);
          return y;
        }
        var w = nuevoImporte(childObject.import);
        var z = nuevoImporte(childObject.total_amount);
        var partialImport = parseFloat(w);//importe de un proveedor en un cierto mes
        var totalImport = parseFloat(z);//importe total para el años correspondiente a esta fila



        var updateProvider = {
                cuil: childObject.cuil,
                grant_title: childObject.grant_title
            },
            options = {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            };

        mongoose.model('Provider').findOneAndUpdate({
            cuil: childObject.cuil
        }, updateProvider, options, function(err, result1) {
            if (err) {
              console.log(err);
              return;
            }
            console.log("updateando provider");
            console.log("result1:"+result1);

            //insercion de category
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
                console.log("result2"+ result2);
                console.log("------------------------------------- RESULT1-ID: "+result1._id);
                console.log("------------------------------------- RESULT2-ID: "+result2._id);

                //insercion de orden de compra
                var Purchase = {
                    year: childObject.year,
                    month: monthNumber,
                    numberOfContracts: childObject.numberOfContracts,
                    import: partialImport,
                    fk_Provider: result1._id,
                    fk_Category: result2._id
                };
                mongoose.model('PurchaseOrder').create(Purchase, function(err, purchase) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    console.log("NEW PURCHASE: " + purchase);
                });//END INSERT PURCHASE
                // return;
                console.log("NEW CATEGORY: " + result2);

            }); //END UPDATE CATEGORY
            // return;
            console.log("NEW PROVIDER: " + result1);

            // result.status(200).send(result);
        });//END UPDATE PROVIDER


        var updateYear = {
                year: childObject.year,
                total_contrats: childObject.total_contrats,
                totalAmount: totalImport
            };
        mongoose.model('Year').findOneAndUpdate({
          year: childObject.year
        },updateYear,options, function(err,years){
          if(err){
            console.log(err);
            return;
          }else{
            console.log("NEW YEAR: "+years);
          }
        });

    }; //end normalize
    return;
}; //end scraping()////////////////////////////////////////////////////////////////////
// 
// time.tic();
// scraping();
// time.toc();


console.log("Si llegamos hasta aca, termino de escrapear bien y continua la app");


///////////////////////////////////////////////////////////////////////////////////
////////////////////////////////SCRAPER////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////











module.exports = app;
