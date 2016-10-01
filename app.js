var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Xray = require('x-ray');
var time = require('node-tictoc');

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




// //Scraper

//Reporte: Proveedores Contratados (por año)
// function year(val){
//   var url='http://www.cdeluruguay.gov.ar/datagov/proveedoresContratados.php';
//   x( url , 'body tr.textoTabla', [{
//           year: 'td',
//           numberOfContracts: 'td:nth-of-type(2)',
//           totalAmount: 'td:nth-of-type(4) | nopoint | nocomma'
//       }])
//       .write('public/jsons/year/years.json');
// };
//
// time.tic();
//  for (var i = 0; i < 1; i++) {
//      year(i);
//  }
// time.toc();
//
//
// //Reporte: Proveedores Contratados Por Año Y Mes
// function yearMonth(val) {
//   var date = new Date();
//   for(i = 2009 ; i <= date.getFullYear(); i++){
//      var url="http://www.cdeluruguay.gov.ar/datagov/proveedoresContratadosAM.php?anio="+i;
//     x( url , 'body tr.textoTabla', [{
//             month: 'td',
//             numberOfVendors: 'td:nth-of-type(2)',
//             amount: 'td:nth-of-type(4) | nopoint | nocomma'
//         }])
//         .write('public/jsons/yearMonth/providers_'+i+'.json');
//   }
// };
// time.tic();
//  for (var i = 0; i < 1; i++) {
//      yearMonth(i);
//  }
// time.toc();
//
// //Reporte: Proveedores Contratados Por Año Y Rubro
// function yearCategory(val) {
//   var date = new Date();
//   for(i = 2009 ; i <= date.getFullYear(); i++){
//      var url="http://www.cdeluruguay.gov.ar/datagov/proveedoresContratadosAR.php?anio="+i;
//     x( url , 'body tr.textoTabla', [{
//             category: 'td',
//             nameCategory: 'td:nth-of-type(2)',
//             numberOfVendors: 'td:nth-of-type(3)',
//             total_amount: 'td:nth-of-type(5) | nopoint | nocomma'
//         }])
//         .write('public/jsons/yearCategory/providers_'+i+'.json');
//   }
// };
// time.tic();
//  for (var i = 0; i < 1; i++) {
//      yearCategory(i);
//  }
// time.toc();
//
//
//
// Reporte: Proveedores Contratados Por Año Y Proveedor

// function yearProvider(val) {
//   var date = new Date();
//   for(i = 2009 ; i <= date.getFullYear(); i++){
//     var url="http://www.cdeluruguay.gov.ar/datagov/proveedoresContratadosAP.php?anio="+i;
//     x( url , 'body tr.textoTabla', [{
//             grant_title: 'td:nth-of-type(2)',
//             cuil: 'td' ,
//             total_amount: 'td:nth-of-type(6) | nopoint | nocomma',
//             total_contrats: 'td:nth-of-type(4) | nopoint',
//             link: 'td:nth-of-type(8) a@href',
//             detail: x('td:nth-of-type(8) a@href','body tr.textoTabla',[{
//               rubro: 'td:nth-of-type(2)'
//             }])
//
//         }])
//         .write('public/jsons/yearProvider/providers_'+i+'.json');
//   }
// };
// time.tic();
//  for (var i = 0; i < 1; i++) {
//      yearProvider(i);
//  }
// time.toc();
//
//

function yearProvider() {
    var date = new Date();
    for(i = 2009 ; i <= date.getFullYear(); i++){
    var url = "http://www.cdeluruguay.gov.ar/datagov/proveedoresContratadosAP.php?anio=" + i;
    x(url, 'body tr.textoTabla', [{
        cuil: 'td',
        grant_title: 'td:nth-of-type(2)',
        total_amount: 'td:nth-of-type(6) | nopoint | nocomma',
        total_contrats: 'td:nth-of-type(4) | nopoint',
        href: 'td:nth-of-type(8) a@href'
    }])(function(err, wrapperObj) {
        wrapperObj.map(wrapperMap, wrapperObj);
    })

    function wrapperMap(mappedObject) {
        var parentObject = this;
        x(mappedObject.href, 'body tr.textoTabla', [{
            cod: 'td',
            category: 'td:nth-of-type(2)',
            href: 'td:nth-of-type(7) a@href'
        }])(function(err, innerWrapperObject) {
            innerWrapperObject.map(innerWrapperMap, {
                provider: mappedObject
            });
        })
    };

    function innerWrapperMap(innerMappedObject) {
        var parentObject = this;
        x(innerMappedObject.href, 'body tr.textoTabla', [{
            month: 'td',
            import: 'td:nth-of-type(4)'
        }])(function(err, finalObject) {
            finalObject.map(normalize, {
                category: innerMappedObject,
                provider: parentObject.provider
            });
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
            cuil: parentObject.provider.cuil,
            grant_title: parentObject.provider.grant_title,
            total_amount: parentObject.provider.total_amount,
            total_contrats: parentObject.provider.total_contrats,
            cod: parentObject.category.cod,
            category: parentObject.category.category,
            month: o.month,
            import: o.import
        }
        console.log(childObject);
    }
};

// time.tic();
// yearProvider();
// time.toc();


// //Reporte: Proveedores Contratados Por Año, Mes Y Rubro
//
// function providersYMC(val) {
//   var date = new Date();
//     for(i = 2009 ; i <= date.getFullYear(); i++){
//       for(j = 1; j<=12 ;j++){
//         var url="http://www.cdeluruguay.gov.ar/datagov/proveedoresContratadosAMR.php?anio="+i+"&mes="+j;
//         x( url , 'body tr.textoTabla', [{
//                 category: 'td',
//                 categotyName: 'td:nth-of-type(2)',
//                 numberOfVendors:'td:nth-of-type(3)',
//                 amount: 'td:nth-of-type(5) | nopoint | nocomma'
//             }])
//             .write('public/jsons/providersYMC/providers_'+i+'_'+j+'.json');
//       }
//   }
// };
// time.tic();
//  for (var i = 0; i < 1; i++) {
//      providersYMC(i);
//  }
// time.toc();







module.exports = app;
