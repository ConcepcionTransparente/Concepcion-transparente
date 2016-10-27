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
var bodyParser = require('body-parser');
var methodOverride = require('method-override'); //used to manipulate POST
var json2csv = require('json2csv');


router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
      }
}));




//ROUTES
router.get('/', function(req, res, next) {
    res.sendfile('public/index.html');
});
// router.get('/demo', function(req, res, next) {
//     res.sendfile('views/demo.html');
// });


//CONTROLLERS
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// CANTIDAD DE ORDENES DE COMPRAS
router.post('/api/post-totalimport',function(req,res,next){
  var start=new Date(req.body.valorini);
  // console.log("START: "+start);
  var end=new Date(req.body.valorfin);
  // console.log("END: "+end);
  var hoy=new Date();
  end.setHours(0,0,0,0);
  hoy.setHours(0,0,0,0);
  // console.log("HOY:"+ hoy);
  // console.log("END:"+ end);
  if (+end === +hoy) {
    // console.log("SON IGUALESSSSSSS!!!!!");
    mongoose.model('PurchaseOrder').aggregate(
       {
         $group : {
            "_id" : null,
            "import": { $sum: "$import" }, // for your case use local.user_totalthings
            // count: { $sum: 1 } // for no. of documents count
         }
       }
      ,function(err,importe){
          // console.log("IMPORTEEEE: "+importe[0].data);
          res.send(importe);
        });
  }else{
    mongoose.model('PurchaseOrder').aggregate(
      [
        {"$match": {date: {$gte:start, $lte:end}}},
       {
         $group : {
            "_id" : null,
            "import": { $sum: "$import" }, // for your case use local.user_totalthings
            // count: { $sum: 1 } // for no. of documents count
         }
       }
      ],function(err,importe){
          // console.log("IMPORTEEEE: "+importe[0].data);
          res.send(importe);
        });
  }

    });
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//CANTIDAD DE PROVEEDORES
router.post('/api/post-totalproviders',function(req,res,next){
  var start=new Date(req.body.valorini);
  // console.log("START: "+start);
  var end=new Date(req.body.valorfin);
  // console.log("END: "+end);
  var hoy=new Date();
  end.setHours(0,0,0,0);
  hoy.setHours(0,0,0,0);
  // console.log("HOY:"+ hoy);
  // console.log("END:"+ end);
  if (+end === +hoy) {
    // console.log("SON IGUALES!!");
    mongoose.model('PurchaseOrder')
    .find()
    .distinct('fk_Provider', function(error, response) {
      // console.log("TOTAL DE PROVEEDORES: "+response);
        res.send(response);
    });
  }else{
    mongoose.model('PurchaseOrder')
    .find({"date": {"$gte": start, "$lte": end}})
    .distinct('fk_Provider', function(error, response) {
      // console.log("TOTAL DE PROVEEDORES: "+response);
        res.send(response);
    });
  }




});
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//CANTIDAD DE ORDENES DE COMPRA
router.post('/api/post-totalorders',function(req,res,next){
  var start=new Date(req.body.valorini);
  // console.log("START: "+start);
  var end=new Date(req.body.valorfin);
  var hoy=new Date();
  end.setHours(0,0,0,0);
  hoy.setHours(0,0,0,0);
  // console.log("HOY:"+ hoy);
  // console.log("END:"+ end);
  if (+end === +hoy) {
          // console.log("SON IGUALES1!!!!");
          mongoose.model('PurchaseOrder')
          .find()
          .distinct('fk_Provider')
          .count(function (err, result) {
              if (err) {
                  return console.log(err);
              } else {
                  // console.log("CANTIDAD DE ORDENES DE COMPRA: "+result);
                  res.json(result);
              }
          });
  }
  else{
    mongoose.model('PurchaseOrder')
    .find({"date": {"$gte": start, "$lte": end}})
    .distinct('fk_Provider')
    .count(function (err, result) {
        if (err) {
            return console.log(err);
        } else {
            // console.log("CANTIDAD DE ORDENES DE COMPRA: "+result);
            res.json(result);
        }
    });
  };
  // console.log("END: "+end);
});
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//BUBBLE CHART
router.get('/api/get-bubblechart',function(req,res,next){
  var start=new Date(2009,00,01);
  // console.log(start);
  var end=new Date(2016,09,27);
  // console.log(end);
  mongoose.model('PurchaseOrder')
  .aggregate(
    [
      {
        "$match": {
          date: {$gte:start, $lte:end}
        }
      }
      ,
     {
       $group : {
          _id : "$fk_Provider",
          total_amount: { $sum: "$import" }, // for your case use local.user_totalthings
          // count: { $sum: 1 } // for no. of documents count
       }
     },
     { "$sort": { import: 1 } }
   ])
  .exec(function(err,result){
    mongoose.model('Provider').populate(result, {path: '_id'}, function(err, populatedTransactions) {
       // Your populated translactions are inside populatedTransactions
      //  console.log(result);
       res.json(populatedTransactions);
    });
  // res.send(result);
  });
});
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// EVOLUCION DEL GASTO - LINECHART
router.post('/api/post-linechart',function(req,res,next){
  var start=new Date(req.body.valorini);
  var startyear = start.getFullYear();
  console.log("holaaaa");
  console.log(startyear);
  var end=new Date(req.body.valorfin);
  console.log(end);
  var endyear = end.getFullYear();
  console.log(endyear);

  // mongoose.model('PurchaseOrder').aggregate(
  //   [
  //     {
  //       "$match": {
  //         date: {$gte:start, $lte:end}
  //       }
  //     },
  //    {
  //      $group : {
  //         _id : "$year",
  //         import: { $sum: "$import" } // for your case use local.user_totalthings
  //         // count: { $sum: 1 } // for no. of documents count
  //      }
  //    },
  //    { "$sort": { "_id": 1 } }
  //
  //   ],function(err,importe){
  //       // console.log(importe);
  //       res.send(importe);
  // });
  mongoose.model('Year').find({"year": {"$gte": startyear, "$lte": endyear}})
  .sort({year: 1})
  .exec(function(err,post){
    if(err){console.log(err);}
    else{
      console.log(post);
      res.send(post);
    }
  })});
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
router.post('/api/post-ranking',function(req,res,next){
  var start=new Date(req.body.valorini);
  // console.log(start);
  var end=new Date(req.body.valorfin);
  // console.log(end);

  mongoose.model('PurchaseOrder')
  .aggregate(
    [
     {
       "$match": {
         date: {$gte:start, $lte:end}
       }
     }
     ,
     {"$group" : {
        _id : "$fk_Provider",
        import: { $sum: "$import" }
        // count: { $sum: 1 } // for no. of documents count
        }
    },
     { "$sort": { import: -1 } },
     { "$limit": 10}
   ])
  .exec(function(err,result){
    // console.log(result);
    mongoose.model('Provider').populate(result, {path: '_id'}, function(err, populatedTransactions) {
       // Your populated translactions are inside populatedTransactions
      //  console.log("RESULTADO: "+populatedTransactions);
       res.send(populatedTransactions);
    });
    var fields = ['importe'];

    var csv = json2csv({ data: result, fields: fields });

    fs.writeFile('manuelEjemplo.csv', csv, function(err) {
      if (err) throw err;
      console.log('file saved');
    });
  // res.send(result);
  });
});
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// CONTRATOS DE OBRAS PUBLICAS Y SERVICIOS
// Reparticion - Proveedor - Detalle
router.post("/api/post-purchase", function(req, res) {
  var start=new Date(req.body.valorini);
  var end=new Date(req.body.valorfin);
  // console.log(start);
  // console.log(end);

  mongoose.model('PurchaseOrder').find({"date": {"$gte": start, "$lte": end}})
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
  console.log("fk_Provider---->: "+ req.params.id);
  mongoose.model('PurchaseOrder').find({'fk_Provider' : req.params.id})
  .sort({year: -1})
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
router.get('/api/get-categories',function(req,res){
  mongoose.model('Category').distinct('category', function(error, response) {
      res.send(response);
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
module.exports = router;
