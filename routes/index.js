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
//example de como obtener el total para cada uno de los PROVEEDORES
router.get('/api/get-example',function(req,res,next){
  mongoose.model('PurchaseOrder')
  .aggregate(
    [
     {
       $group : {
          _id : "$fk_Provider",
          import: { $sum: "$import" }, // for your case use local.user_totalthings
          // count: { $sum: 1 } // for no. of documents count
       }
     },
     { "$sort": { import: 1 } }
   ])
  .exec(function(err,result){
    mongoose.model('Provider').populate(result, {path: '_id'}, function(err, populatedTransactions) {
       // Your populated translactions are inside populatedTransactions
       res.send(result);
    });
  // res.send(result);
  });
});







////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// CANTIDAD DE ORDENES DE COMPRAS
router.get('/api/get-totalorders',function(req,res,next){
  mongoose.model('PurchaseOrder').aggregate(
    [
 {
   $group : {
      "_id" : null,
      "import": { $sum: "$import" }, // for your case use local.user_totalthings
      // count: { $sum: 1 } // for no. of documents count
   }
 }
],function(err,importe){
    console.log(importe);
    res.send(importe);
  });
});

//CANTIDAD DE PROVEEDORES
router.get('/api/get-totalproviders',function(req,res,next){
  mongoose.model('Provider').count({},function(err,result){
    if (err) {
        return console.log(err);
    } else {
      console.log("Cantidad de proveedores: "+ result);
        res.json(result);
    }
  })
});
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

//PROMEDIO GASTO MENSUAL

//CANTIDAD DE ORDENES DE COMPRA
router.get('/api/get-orders',function(req,res,next){
  mongoose.model('PurchaseOrder').count({},function(err,result){
    if (err) {
        return console.log(err);
    } else {
      console.log("Cantidad de ordenes de compra: "+ result);
        res.json(result);
    }
  })
});
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//BUBBLE CHART



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// EVOLUCION DEL GASTO - LINECHART
router.get('/api/get-linechart',function(req,res,next){
  mongoose.model('PurchaseOrder').aggregate(
    [
 {
   $group : {
      _id : "$year",
      import: { $sum: "$import" } // for your case use local.user_totalthings
      // count: { $sum: 1 } // for no. of documents count
   }
 },
 { "$sort": { "_id": 1 } }

],function(err,importe){
    console.log(importe);
    res.send(importe);
  });
});
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// RANKING DE PROVEEDORES
// router.get("/api/get-ranking",function(req,res){
//   mongoose.model('PurchaseOrder').find()
//   .sort({import: -1})
//   .limit(10)
//   .populate('fk_Provider')
//   .exec(function(err,post){
//     if(err){console.log(err);}
//     else{
//       // console.log(post);
//       res.send(post);
//     }
//   });
// });
router.get('/api/get-ranking',function(req,res,next){
  mongoose.model('PurchaseOrder')
  .aggregate(
    [
     {
       $group : {
          _id : "$fk_Provider",
          import: { $sum: "$import" }, // for your case use local.user_totalthings
          // count: { $sum: 1 } // for no. of documents count
       }
     },
     { "$sort": { import: -1 } },
     { "$limit": 10}
   ])
  .exec(function(err,result){
    mongoose.model('Provider').populate(result, {path: '_id'}, function(err, populatedTransactions) {
       // Your populated translactions are inside populatedTransactions
       res.send(result);
    });
  // res.send(result);
  });
});
// router.get('/api/get-ranking',function(err,res){
//   mongoose.model('PurchaseOrder')
//   .aggregate(
//     {$group:
//       {_id:"NOMBRE",
//       suma: {$sum: "import"}
//     }
//     }
//   )
//   .exec(function(err,result){
//     populate(result,{path:'fk_Provider'},function(err,populatedresult){
//       populate(populatedresult,{path: 'fk_Category'},function(err,finalresult){
//         res.send(finalresult);
//       })
//     });
//   });
// });

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// CONTRATOS DE OBRAS PUBLICAS Y SERVICIOS
// Reparticion - Proveedor - Detalle
router.get("/api/get-purchase", function(req, res) {
    mongoose.model('PurchaseOrder').find()
    .sort({import: -1})
    // .limit(5)
    .populate('fk_Category')
    .populate('fk_Provider')
    .exec(function(err,post){
      if(err){console.log(err);}
      else{
        // console.log(post);
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
      // console.log("el resultado es: "+ result);
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
