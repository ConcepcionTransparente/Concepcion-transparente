var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var db = require('../model/db');
var model = require('../model/model');
var fs = require('fs');

//var xrayController = require('../Controllers/xrayController');




//ROUTES
router.get('/', function(req, res,next) {
    res.sendfile('public/index.html');
});
router.get('/demo', function(req, res,next) {
    res.sendfile('views/demo.html');
});
//------------------------------------------------------------------------------

//CONTROLLERS
// GET YEARPROVIDERS, ME SIRVE PARA LA TABLA
// POST YEARPROVIDERS, ME SIRVE PARA LA TABLA
router.post('/api/post-yearprovider',function(req,res,next){
  fs.readFile('./public/jsons/yearProvider/providers_2016.json', 'utf8', function (err, data) {
    if (err){return console.log(err);};
    var obj = JSON.parse(data);
    //console.log(data);
    mongoose.model('yearProvider').create( obj , function(err,provider){
      if(err){
        console.log('---> /api/post-yearprovider BACKEND error  create()');
        return console.log(err);
      }else{
        console.log('mongoose ---> api/post-yearprovider BACKEND create() is OK!');
        res.send(provider);
      }
    });
  });
});
router.get('/api/get-yearprovider',function(req,res,next){
  mongoose.model('yearProvider').find({},function(err,provider){
    if(err){
      console.log('mongoose error find()');
      // return console.log(err);
      res.send(err);
    }else{
      res.json(provider);
    }
  });
});






// GET YEAR, ME SIRVE PARA CONSULTAS GENERALES
router.post('/api/post-year',function(req,res,next){
  //luego muevo esto a las tareas que se realizan durante la noche
  fs.readFile('./public/jsons/year/years.json', 'utf8', function (err, data) {
    if (err){res.send(err);};
    var obj = JSON.parse(data);
    //console.log(data);
    mongoose.model('year').create( obj , function(err,provider){
      if(err){
        console.log('---> /api/post-year error  create()');
        return console.log(err);
      }else{
        console.log('mongoose ---> api/post-year  create() is OK!');
        res.send(provider);
      }
    });
  });
});
// GET YEAR, ME SIRVE PARA CONSULTAS GENERALES
router.get('/api/get-year',function(req,res,next){
  mongoose.model('year').find({},function(err,year){
    if(err){
      console.log('mongoose ---> /api/get-year BACKEND error find()');
      // return console.log(err);
    }else{
      res.json(year);
    }
  });
});

// POST YEAR
// router.post('/api/post-year',function(req,res,next){
//   var year = req.body.year;
//   var numberOfContracts = req.body.numberOfContracts;
//   var total_amount = req.body.total_amount;
//   var obj = {
//     year: year,
//     numberOfContracts: numberOfContracts,
//     total_amount: total_amount
//   };
//   mongoose.model('year').create( obj , function(err,year){
//     if(err){
//       console.log('mongoose error create()');
//       return console.log(err);
//     }else{
//       console.log('mongoose create YEAR is OK!');
//       console.log(year);
//       res.send(year);
//     }
//   });
// });





// GET CANTIDAD DE PROVEEDORES
router.get('/api/get-totalproviders',function(req,res,next){
  mongoose.model('yearProvider').count({},function(err,c){
    if(err){
      console.log('mongoose error count()');
      return console.log(err);
    }else{
      res.json(c);
      //console.log(c);
    }
  });
});

module.exports = router;
