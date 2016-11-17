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
// router.get('/api/get-importHistory',function(req,res,next){
//
//   mongoose.model('PurchaseOrder').aggregate(
//     [
//      {
//        $group : {
//           "_id" : null,
//           "import": { $sum: "$import" }, // for your case use local.user_totalthings
//           // count: { $sum: 1 } // for no. of documents count
//        }
//      }
//     ],function(err,importe){
//         console.log("HISTORY IMPORT: "+importe[0].data);
//         res.send(importe);
//   });
// });

// router.get('/api/get-providersHistory',function(req,res,next){
//   mongoose.model('PurchaseOrder')
//   .find()
//   .distinct('fk_Provider', function(error, response) {
//     console.log("HISTORY PROVIDERS: "+response);
//       res.send(response);
//   });
//
// });
//
// router.get('/api/get-ordersHistory',function(req,res,next){
//   mongoose.model('PurchaseOrder')
//   .find()
//   .distinct('fk_Provider')
//   .count(function (err, result) {
//       if (err) {
//           return console.log(err);
//       } else {
//           console.log("HISTORY ORDERS: "+result);
//           res.json(result);
//       }
//   });
//
// });

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// CANTIDAD DE ORDENES DE COMPRAS
router.post('/api/post-totalimport',function(req,res,next){
  var start=new Date(req.body.valorini);
  console.log("START: "+start);
  var end=new Date(req.body.valorfin);
  console.log("END: "+end);
  var hoy=new Date();
  end.setHours(0,0,0,0);
  hoy.setHours(0,0,0,0);
  // console.log("HOY:"+ hoy);
  // console.log("END:"+ end);
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
  mongoose.model('PurchaseOrder')
  .find({"date": {"$gte": start, "$lte": end}})
  .distinct('fk_Provider', function(error, response) {
    // console.log("TOTAL DE PROVEEDORES: "+response);
      res.send(response);
  });

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

});
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//BUBBLE CHART
router.post('/api/post-bubblechart',function(req,res,next){
  var start=new Date(req.body.valorini);
  // console.log(start);
  var end=new Date(req.body.valorfin);
  // console.log(end);
  var hoy=new Date();
  end.setHours(0,0,0,0);
  hoy.setHours(0,0,0,0);
  // console.log(end);
  // console.log("CATEGORY BACKEND: "+req.body.category);
  if(!req.body.category){
    console.log("TODAS LAS CATEGORIAS: " + req.body.category);
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
            total_amount: { $sum: "$import" } // for your case use local.user_totalthings
            // count: { $sum: 1 } // for no. of documents count
         }
       },
       { "$sort": { import: 1 } }
     ])
    .exec(function(err,result){
      mongoose.model('Provider').populate(result, {path: '_id'}, function(err, populatedTransactions) {
         // Your populated translactions are inside populatedTransactions
        //  console.log("BUBBLECHART: "+result);
         res.json(populatedTransactions);
      });
    // res.send(result);
    });
  }
  else
  {
    var Category = mongoose.Types.ObjectId(req.body.category);
    console.log("ALGUNA CATEGORIA: "+ Category);
    mongoose.model('PurchaseOrder')
    .aggregate(
      [
        {
          "$match": {
            date: {$gte:start, $lte:end},
            fk_Category:Category
          }
        }
        ,
       {
         $group : {
            _id : "$fk_Provider",
            total_amount: { $sum: "$import" } // for your case use local.user_totalthings
            // count: { $sum: 1 } // for no. of documents count
         }
       },
       { "$sort": { import: 1 } }
     ])
    .exec(function(err,result){
      mongoose.model('Provider').populate(result, {path: '_id'}, function(err, populatedTransactions) {
         // Your populated translactions are inside populatedTransactions
        //  console.log("BUBBLECHART: "+result);
         res.json(populatedTransactions);
      });
    // res.send(result);
    });
  }

});
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// EVOLUCION DEL GASTO - LINECHART
router.post('/api/post-linechart',function(req,res,next){
  var start=new Date(req.body.valorini);
  var startyear = start.getFullYear();
  // console.log("holaaaa");
  // console.log(startyear);
  var end=new Date(req.body.valorfin);
  // console.log(end);
  var endyear = end.getFullYear();
  // console.log(endyear);
  mongoose.model('Year').find({"year": {"$gte": startyear, "$lte": endyear}})
  .sort({year: 1})
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
      docs=populatedTransactions.map(function(result){
        return {
          "nombre":result._id.grant_title,
          "cuit":result._id.cuil,
          "importe":result.import,
          "id":result._id._id
        }
      });
      res.send(docs);
      // console.log(docs);
      //  res.json(populatedTransactions);
    });
  // res.send(result);
  });

});
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// CONTRATOS DE OBRAS PUBLICAS Y SERVICIOS
// Reparticion - Proveedor - Detalle
router.post("/api/post-purchases", function(req, res) {
  var start=new Date(req.body.valorini);
  var end=new Date(req.body.valorfin);
  console.log("REQ.BODY.CATEGORY: "+ req.body.category);

  if(!req.body.category){
    mongoose.model('PurchaseOrder')
    .find({"date": {"$gte": start, "$lte": end}})
    .sort({import: -1})
    .populate('fk_Category')
    .populate('fk_Provider')
    .exec(function(err,populatedTransactions){
      if(err){console.log(err);}
      else{
        // console.log(result);
        docs=populatedTransactions.map(function(result){
          return {
            "anio":result.year,
            "mes":result.month,
            "nombre":result.fk_Provider.grant_title,
            "reparticion":result.fk_Category.category,
            "importe":result.import,
            "id":result.fk_Provider._id
          }
        });
        res.send(docs);
      }
    })
  }
  else{
    mongoose.model('PurchaseOrder')
    .find({"date": {"$gte": start, "$lte": end},"fk_Category":req.body.category})
    .sort({import: -1})
    .populate('fk_Category')
    .populate('fk_Provider')
    .exec(function(err,populatedTransactions){
      if(err){console.log(err);}
      else{
        // console.log(result);
        docs=populatedTransactions.map(function(result){
          return {
            "anio":result.year,
            "nombre":result.fk_Provider.grant_title,
            "reparticion":result.fk_Category.category,
            "importe":result.import,
            "id":result.fk_Provider._id
          }
        });
        res.send(docs);
      }
    })
  }

});
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// CONTRATOS DE OBRAS PUBLICAS Y SERVICIOS (DETALLE DE CADA PROVEEDOR)
router.get("/:id", function(req,res){
  // console.log("fk_Provider---->: "+ req.params.id);
  mongoose.model('PurchaseOrder').find({'fk_Provider' : req.params.id})
  .sort({date: -1})
  .populate('fk_Category')
  .populate('fk_Provider')
  .exec(function(err,populatedTransactions){
    if(err){console.log(err);}
    else{
      docs=populatedTransactions.map(function(result){
        return {
          "nombre":result.fk_Provider.grant_title,
          "cuit":result.fk_Provider.cuil,
          "reparticion":result.fk_Category.category,
          "importe":result.import,
          "fecha":result.date
        }
      });
      console.log(docs);
      res.send(docs);
    }
  })
});
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
router.get('/api/get-categories',function(req,res){
  mongoose.model('Category').distinct('category', function(error, response) {
      // console.log(response);
      res.send(response);
  });
});

router.post('/api/post-categoryID',function(req,res){
  mongoose.model('Category')
  .find({"category":req.body.categorySelect})
  .exec(function(err,response){
    if(err){res.send(err);}
    else{
      console.log("CATEGORIA ENCONTRADA: "+response);
      res.send(response);
    }

  });
});

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//RANKING OBRA PUBLICAS
  router.post('/api/post-rankingObraPublica',function(req,res){
    var start=new Date(req.body.valorini);
    var end=new Date(req.body.valorfin);
    mongoose.model('Category')
    .find({"category":"SERVICIO OBRA PUBLICA"})
    .exec(function(err,categoryID){
      if(err){res.send(err);}
      else{
        console.log("CATEGORIA ENCONTRADA: "+categoryID);
        var newId = new mongoose.mongo.ObjectId('580be5dddf50704715ece3cd');
        ////////////////////
        mongoose.model('PurchaseOrder')
        .aggregate(
          [
           {
             "$match": {
               date: {$gte:start, $lte:end},
               fk_Category:newId //ID DE LA CATEGORIA SERVICIO OBRA PUBLICA
             }
           },
           {"$group" : {
              _id : "$fk_Provider",
              import: { $sum: "$import" }
              }
          },
           { "$sort": { import: -1 } },
           { "$limit": 10}
         ])
        .exec(function(err,result){
          mongoose.model('Provider').populate(result, {path: '_id'}, function(err, populatedTransactions) {
              console.log("PROVEEDORES:"+populatedTransactions);
              result=populatedTransactions.map(function(result){
                return {
                  "nombre":result._id.grant_title,
                  "cuit":result._id.cuil,
                  "importe":result.import,
                  "id":result._id._id
                }
              });
              console.log(result);
             res.send(result);
          });
        });
      }//end else
    });//end exec principal
  });//end route.post
  ////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////
router.get('/api/get-Providers',function(req,res){
  mongoose.model('PurchaseOrder')
  .aggregate(
    [
     {"$group" : {
        _id : "$fk_Provider",
        import: { $sum: "$import" }
        }
    },
     { "$sort": { import: -1 } },
   ])
   .exec(function(err,result){
    mongoose.model('Provider').populate(result, {path: '_id'}, function(err, populatedTransactions) {
      docs=populatedTransactions.map(function(result){
        return {
          "nombre":result._id.grant_title,
          "cuit":result._id.cuil,
          "importe":result.import,
          "id":result._id._id
        }
      });
      res.send(docs);
      // console.log(docs);
      //  res.json(populatedTransactions);
    });
  // res.send(result);
  });
});




  module.exports = router;
