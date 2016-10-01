var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var db = require('../model/db');
var model = require('../model/model');
var fs = require('fs');
var async = require('async');

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
  }).sort({ 'total_amount': 'descending' }).limit(10);
});


//------------------------------------------------------------------------------

// POST YEAR, ME SIRVE PARA CONSULTAS GENERALES
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
      return console.log(err);
    }else{
      res.json(year);
    }
  }).limit(1); //solo obtengo año 2016
});

// GET CANTIDAD DE PROVEEDORES
router.get('/api/get-totalproviders',function(req,res,next){
  mongoose.model('yearProvider').count({},function(err,c){
    if(err){
      console.log('mongoose error count()');
      return console.log(err);
    }else{
      res.json(c);
      // console.log("Cantidad de PROVEEDORES: " + c);
    }
  });
});

// CANTIDAD DE ORDENES DE COMPRAS
router.get('/api/get-totalorders',function(req,res,next){
  mongoose.model('yearProvider').aggregate([
          { $group: {
            _id : null,
            sumatoria: { $sum: "$total_contrats"  }
          }}
      ], function (err, result) {
          if (err) {
              return console.log(err);;
          }
          // console.log(result);
          res.json(result);
      });
});


// GET YEAR, ME SIRVE PARA CONSULTAS GENERALES
router.get('/api/get-linechart',function(req,res,next){
  mongoose.model('year').find({},function(err,linechart){
    if(err){
      console.log('mongoose ---> /api/get-year BACKEND error find() LINE CHART');
      return console.log(err);
    }else{
      console.log("SE ENVIO DESDE BACKEND EL LINECHART A FRONTEND");
      res.json(linechart);
    }
  });
});

module.exports = router;
