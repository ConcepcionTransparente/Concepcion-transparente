////////////////////////////////////////////////////////////////////////////////
//////////////////////////////NODE BACKEND//////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var db = require('../model/db');
var model = require('../model/model');
var fs = require('fs');
var async = require('async');



//ROUTES
router.get('/', function(req, res, next) {
    res.sendfile('public/index.html');
});
router.get('/demo', function(req, res, next) {
    res.sendfile('views/demo.html');
});


////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// router.get("/api/get-ranking", function(req, res) {
//     mongoose.model('PurchaseOrder').find({}, function(err, purchases) {
//       // console.log(purchases);
//         mongoose.model('Provider').populate(purchases, {path: "fk_Provider"},function(err, provider){
//             // console.log(provider);
//             res.status(200).send(provider);
//         });
//     })
//     .sort({'import': 'descending'})
//     .limit(10);
// });

router.get("/api/get-ranking",function(req,res){
  mongoose.model('PurchaseOrder').find()
  .sort({import: -1})
  .limit(10)
  .populate('fk_Provider')
  .exec(function(err,post){
    if(err){console.log(err);}
    else{
      console.log(post);
      res.send(post);
    }
  });
});


////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// GET YEAR, ME SIRVE PARA CONSULTAS GENERALES

//
// router.get('/api/get-generalTotalProviders', function(req, res, next) {
//     mongoose.model('PurchaseOrder').find({
//         anio: 2016
//     }, function(err, providers) {
//         if (err) {
//             console.log('mongoose ---> /api/get-year BACKEND error find()');
//             return console.log(err);
//         } else {
//             console.log(providers);
//             res.json(year);
//         }
//     }).distinct(cuil);
// });

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// CANTIDAD DE ORDENES DE COMPRAS
router.get('/api/get-totalorders',function(req,res,next){
  mongoose.model('PurchaseOrder').aggregate(
   [
    {
      $group : {
         _id : "null",
         totaldocs: { $sum: { $ifNull: ["$PurchaseOrder.price", 0] } }, // for your case use local.user_totaldocs
         count: { $sum: 1 } // for no. of documents count
      }
    }
  ],function(err,result){
    if(err){console.log(err);}
    else{
      console.log("------------"+result[0]);
    }
  });
});


////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// EVOLUCION DEL GASTO - LINECHART
router.get('/api/get-linechart', function(req, res, next) {
    mongoose.model('Year').find({}, function(err, result) {
        if (err) {
            return console.log(err);
        } else {
            res.json(result);
        }
    })
    .sort({'year': 'ascending'})
    .limit(10);
});

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// CONTRATOS DE OBRAS PUBLICAS Y SERVICIOS
// Reparticion - Proveedor - Detalle

router.get("/api/get-purchase", function(req, res) {
    // mongoose.model('PurchaseOrder').find({}, function(err, purchases) {
    //   if(err){return console.log(err);}
    //   else{
    //     mongoose.model('Category').populate(purchases, {path: "fk_Category"},function(err, category){
    //         if(err){return console.log(err);}
    //         else{
    //           // console.log(category);
    //           res.status(200).send(category);
    //         }
    //     });
    //   }
    // })
    // .sort({'year': 'ascending'})
    // .limit(5);
    mongoose.model('PurchaseOrder').find()
    .sort({import: -1})
    .limit(5)
    .populate('fk_Category')
    .populate('fk_Provider')
    .exec(function(err,post){
      if(err){console.log(err);}
      else{
        console.log(post);
        res.send(post);
      }
    })
});

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// CONTRATOS DE OBRAS PUBLICAS Y SERVICIOS (DETALLE DE CADA PROVEEDOR)


router.get("/:id", function(req,res){
  console.log("fk_Provider: "+ req.params.id);
  mongoose.model('PurchaseOrder').find({'fk_Provider' : req.params.id}, function(err,result){
    if (err) {
      console.log(err);
    }else {
      console.log("el resultado es: "+ result);
      res.status(200).send(result);
    }
  });
})


// router.get('/api/get-purchase', function(req, res, next) {
//     // mongoose.model('PurchaseOrder').find({},function(err,purchase){
//     //   if(err) return console.log(err);
//     //   res.json(purchase);
//     // }).limit(30).sort({'year': 'descending'});
//     mongoose.model('PurchaseOrder').find({}, function(err, purchases) {
//         var purchasesCuils;
//         if (err) {
//             console.log(err);
//             return;
//         }
//         purchasesCuils = purchases.map(function(purchase) {
//             return purchase.cuil;
//         });
//         // console.log("hasta aca hemos llegado");
//         console.log(purchasesCuils);
//
//         mongoose.model('Provider').find({
//             cuil: {
//                 "$in": purchasesCuils
//             }
//         }, function(err, providers) {
//             if (err) {
//                 console.log(err);
//                 return;
//             }
//
//             var _purchases=JSON.parse(JSON.stringify(purchases));
//             _purchases.forEach(function(purchase) {
//                 var _providers = providers.filter(function(provider) {
//                     return provider.cuil === this.cuil;
//                 }, purchase);
//                 purchase.provider = providers[0].grant_title;
//             });
//
//             console.log(_purchases);
//             res.send(_purchases);
//         });
//     }).limit(3);
// });

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
module.exports = router;
