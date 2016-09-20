var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var db = require('../model/db');
var model = require('../model/model');
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
router.get('/api/get-yearprovider',function(req,res,next){
  mongoose.model('yearProvider').find({},function(err,provider){
    if(err){
      console.log('mongoose error find()');
      return console.log(err);
    }else{
      res.json(provider);
    }
  });
});

// POST YEARPROVIDERS, ME SIRVE PARA LA TABLA
router.post('/api/post-yearprovider',function(req,res,next){
  // var cuil = req.body.cuil;
  // var grant_title = req.body.grant_title;
  // var total_amount = req.body.total_amount;
  // var obj = {
  //   cuil: cuil,
  //   grant_title: grant_title,
  //   total_amount: total_amount
  // };
  var obj={
    cuil: 202020202,
    grant_title: 'Maxi Paiva',
    total_amount: 980100100
  }
  console.log(obj);
  //mongoose create in yearProvider
  mongoose.model('yearProvider').create( obj , function(err,provider){
    if(err){
      console.log('mongoose error create()');
      return console.log(err);
    }else{
      console.log('mongoose create is OK!');
      res.send(provider);
    }
  });
});







// GET YEAR, ME SIRVE PARA CONSULTAS GENERALES
router.get('/api/get-year',function(req,res,next){
  mongoose.model('year').find({},function(err,year){
    if(err){
      console.log('mongoose error find()');
      return console.log(err);
    }else{
      res.json(year);
    }
  });
});

// POST YEAR
router.post('/api/post-year',function(req,res,next){
  var year = req.body.year;
  var numberOfContracts = req.body.numberOfContracts;
  var total_amount = req.body.total_amount;
  var obj = {
    year: year,
    numberOfContracts: numberOfContracts,
    total_amount: total_amount
  };
  mongoose.model('year').create( obj , function(err,year){
    if(err){
      console.log('mongoose error create()');
      return console.log(err);
    }else{
      console.log('mongoose create YEAR is OK!');
      console.log(year);
      res.send(year);
    }
  });
});


// GET CANTIDAD DE PROVEEDORES
router.get('/api/get-totalproviders',function(req,res,next){
  mongoose.model('yearProvider').count({},function(err,c){
    if(err){
      console.log('mongoose error count()');
      return console.log(err);
    }else{
      res.json(c);
      console.log(c);
    }
  });
});

module.exports = router;
