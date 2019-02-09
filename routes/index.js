// Express backend (Node)
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

// Routes
router.get('/', function(req, res, next) {
  res.sendfile('public/index.html');
});

// Favicon handling based on:
// https://stackoverflow.com/questions/35408729/express-js-prevent-get-favicon-ico
router.get('/favicon.ico', function (req, res) {
  res.status(204);
});

// router.get('/demo', function(req, res, next) {
//     res.sendfile('views/demo.html');
// });

// Controllers

// router.get('/api/get-importHistory',function(req, res, next){
//
//   mongoose.model('PurchaseOrder').aggregate(
//     [
//      {
//        $group : {
//           '_id' : null,
//           'import': { $sum: '$import' }, // for your case use local.user_totalthings
//           // count: { $sum: 1 } // for no. of documents count
//        }
//      }
//     ],function(err,importe){
//         console.log('HISTORY IMPORT: '+importe[0].data);
//         res.send(importe);
//   });
// });

// router.get('/api/get-providersHistory',function(req, res, next){
//   mongoose.model('PurchaseOrder')
//   .find()
//   .distinct('fk_Provider', function(error, response) {
//     console.log('HISTORY PROVIDERS: '+response);
//       res.send(response);
//   });
//
// });
//
// router.get('/api/get-ordersHistory',function(req, res, next){
//   mongoose.model('PurchaseOrder')
//   .find()
//   .distinct('fk_Provider')
//   .count(function (err, result) {
//       if (err) {
//           return console.log(err);
//       } else {
//           console.log('HISTORY ORDERS: '+result);
//           res.json(result);
//       }
//   });
//
// });

// Cantidad de órdenes de compra
router.post('/api/post-totalimport', function(req, res, next) {
  var start = new Date(req.body.valorini.substr(0, 10));
  var end = new Date(req.body.valorfin.substr(0, 10));

  mongoose.model('PurchaseOrder').aggregate(
    [
      { '$match': { date: { $gte: start, $lte: end } } },
      {
        $group : {
          '_id' : null,
          'import': { $sum: '$import' },
          'count': { $sum: 1 }
       }
     }
    ],
    function(err,importe) {
        res.send(importe);
    }
  );
});

// Cantidad de proveedores
router.post('/api/post-totalproviders', function(req, res, next) {
  var start = new Date(req.body.valorini.substr(0, 10));
  var end = new Date(req.body.valorfin.substr(0, 10));

  mongoose.model('PurchaseOrder')
    .find({'date': {'$gte': start, '$lte': end}})
    .distinct('fk_Provider', function(error, response) {
      res.send(response);
    });
});

// Cantidad de órdenes de compra
router.post('/api/post-totalorders', function(req, res, next) {
  var start = new Date(req.body.valorini.substr(0, 10));
  var end = new Date(req.body.valorfin.substr(0, 10));

  mongoose.model('PurchaseOrder')
    .find({'date': {'$gte': start, '$lte': end}})
    .distinct('fk_Provider')
    .count(function (err, result) {
        if (err) {
            return console.log(err);
        }

        res.json(result);
    });
});

// Bubble chart
router.post('/api/post-bubblechart', function(req, res, next) {
  var start = new Date(req.body.valorini.substr(0, 10));
  var end = new Date(req.body.valorfin.substr(0, 10));

  if (req.body.category) {
    var Category = mongoose.Types.ObjectId(req.body.category);

    mongoose.model('PurchaseOrder')
      .aggregate(
        [
          {
            '$match': {
              date: {$gte:start, $lte:end},
              fk_Category:Category
            }
          }
          ,
         {
           $group : {
              _id : '$fk_Provider',
              total_amount: { $sum: '$import' } // for your case use local.user_totalthings
              // count: { $sum: 1 } // for no. of documents count
           }
         },
         { '$sort': { import: 1 } }
       ])
      .exec(function(err,result){
        mongoose.model('Provider').populate(result, { path: '_id' }, function(err, populatedTransactions) {
           res.json(populatedTransactions);
        });
      // res.send(result);
      });

    return;
  }

  mongoose.model('PurchaseOrder')
    .aggregate(
      [
        {
          '$match': {
            date: {$gte:start, $lte:end}
          }
        }
        ,
       {
         $group : {
            _id : '$fk_Provider',
            total_amount: { $sum: '$import' } // for your case use local.user_totalthings
            // count: { $sum: 1 } // for no. of documents count
         }
       },
       { '$sort': { import: 1 } }
     ])
    .exec(function(err,result){
      mongoose.model('Provider').populate(result, { path: '_id' }, function(err, populatedTransactions) {
         // Your populated translactions are inside populatedTransactions
         res.json(populatedTransactions);
      });
    // res.send(result);
    });
});

// Evolución del gasto - ºArt
router.post('/api/post-linechart', function(req, res, next) {
  var start = new Date(req.body.valorini.substr(0, 10));
  var startyear = start.getFullYear();

  var end = new Date(req.body.valorfin.substr(0, 10));
  var endyear = end.getFullYear();

  mongoose
    .model('Year')
    .find({ 'year': { '$gte': startyear, '$lte': endyear } })
    .sort({ year: 1 })
    .exec(function(err, post){
      if (err) {
        console.log(err);

        return;
      }

      res.send(post);
    });
});

router.post('/api/post-ranking', function(req, res, next) {
  var start = new Date(req.body.valorini.substr(0, 10));
  var end = new Date(req.body.valorfin.substr(0, 10));
  mongoose.model('PurchaseOrder')
    .aggregate(
      [
       {
         '$match': {
           date: {$gte: start, $lte: end}
         }
       }
       ,
       {'$group' : {
          _id : '$fk_Provider',
          import: { $sum: '$import' }
          // count: { $sum: 1 } // for no. of documents count
          }
      },
       { '$sort': { import: -1 } },
       { '$limit': 10}
     ])
     .exec(function(err,result){
      mongoose.model('Provider').populate(result, { path: '_id' }, function(err, populatedTransactions) {
         // Your populated translactions are inside populatedTransactions
        docs = populatedTransactions.map(function(result){
          return {
            'nombre':result._id.grant_title,
            'cuit':result._id.cuil,
            'importe':result.import,
            'id':result._id._id
          }
        });
        res.send(docs);
      });
    });
});

// Contratos de obras públicas y servicios
router.post('/api/post-purchases', function(req, res) {
  var start=new Date(req.body.valorini.substr(0, 10));
  var end=new Date(req.body.valorfin.substr(0, 10));

  if (!req.body.category) {
    mongoose.model('PurchaseOrder')
      .find({'date': {'$gte': start, '$lte': end}})
      .sort({import: -1})
      .populate('fk_Category')
      .populate('fk_Provider')
      .exec(function(err,populatedTransactions){
        if (err){console.log(err);}
        else{
          docs=populatedTransactions.map(function(result){
            return {
              'idPO': result._id,
              'anio':result.year,
              'mes':result.month,
              'fecha': result.date,
              'nombre':result.fk_Provider.grant_title,
              'reparticion':result.fk_Category.category,
              'importe':result.import,
              'id':result.fk_Provider._id
            }
          });
          res.send(docs);
        }
      });
  } else {
    mongoose.model('PurchaseOrder')
      .find({'date': {'$gte': start, '$lte': end},'fk_Category':req.body.category})
      .sort({import: -1})
      .populate('fk_Category')
      .populate('fk_Provider')
      .exec(function(err,populatedTransactions){
        if (err){console.log(err);}
        else{
          docs=populatedTransactions.map(function(result){
            return {
              'anio':result.year,
              'mes':result.month,
              'fecha': result.date,
              'nombre':result.fk_Provider.grant_title,
              'reparticion':result.fk_Category.category,
              'importe':result.import,
              'id':result.fk_Provider._id
            }
          });
          res.send(docs);
        }
      });
  }
});

router.post('/deleteOrders', function(req,res) {
  mongoose
    .model('PurchaseOrder')
    .remove({ _id: req.body.id }, function(err) {
      if (!err) {
        console.log('removed!');
      } else {
        console.log(err);
      }
    });
})

// Contratos de obras publicas y servicios (detalle de cada proveedor)
router.get('/:id', function(req,res) {

  mongoose.model('PurchaseOrder').find({'fk_Provider' : req.params.id})
    .sort({date: -1})
    .populate('fk_Category')
    .populate('fk_Provider')
    .exec(function(err,populatedTransactions){
      if (err) { console.log(err); }
      else {
        docs = populatedTransactions.map(function(result){
          return {
            'nombre':result.fk_Provider.grant_title,
            'cuit':result.fk_Provider.cuil,
            'reparticion':result.fk_Category.category,
            'importe':result.import,
            'fecha':result.date
          }
        });
        res.send(docs);
      }
    });
});

router.get('/api/get-categories', function(req,res) {
  mongoose
    .model('Category')
    .distinct('category', function(error, response) {
      res.send(response.sort());
    });
});

router.post('/api/post-categoryID', function(req,res) {
  mongoose.model('Category')
  .find({'category':req.body.categorySelect})
  .exec(function(err,response){
    if (err) { res.send(err); }
    else {
      res.send(response);
    }

  });
});

// Ranking obra publicas
router.post('/api/post-rankingObraPublica', function(req, res) {
  var start = new Date(req.body.valorini.substr(0, 10));
  var end = new Date(req.body.valorfin.substr(0, 10));

  mongoose.model('Category')
    .findOne({'category': 'SERVICIO OBRA PUBLICA'})
    .exec()
    .then(function(category) {
      categoryId = category._id

      mongoose.model('PurchaseOrder')
        .aggregate([
          {
            '$match': {
              date: { $gte: start, $lte: end },

              // Id de la categoría de servicio para obra pública
              fk_Category: mongoose.mongo.ObjectId(categoryId)
            }
          },
          {
            '$group': {
              _id : '$fk_Provider',
              import: { $sum: '$import' }
            }
          },
          {'$sort': { import: -1 }},
          {'$limit': 10}
        ])
        .exec()
        .then(function(result) {
          mongoose.model('Provider')
            .populate(
              result,
              { path: '_id' },
              function(err, populatedTransactions) {
                result = populatedTransactions.map(function(result) {
                  return {
                    'nombre':result._id.grant_title,
                    'cuit':result._id.cuil,
                    'importe':result.import,
                    'id':result._id._id
                  }
                });

                 res.send(result);
              });
        });
    })
    .catch(function(error) {
      res.send(error);
    });
});

router.get('/api/get-Providers', function(req, res) {
  mongoose.model('PurchaseOrder')
  .aggregate(
    [
     {'$group' : {
        _id : '$fk_Provider',
        import: { $sum: '$import' }
        }
    },
     { '$sort': { import: -1 } },
   ])
   .exec(function(err,result){
    mongoose.model('Provider').populate(result, { path: '_id' }, function(err, populatedTransactions) {
      docs = populatedTransactions.map(function(result){
        return {
          'nombre':result._id.grant_title,
          'cuit':result._id.cuil,
          'importe':result.import,
          'id':result._id._id
        }
      });
      res.send(docs);
    });
  });
});

// Detail categories
router.post('/api/post-detailCategories', function(req, res) {
  var start = new Date(req.body.valorini.substr(0, 10));
  var end = new Date(req.body.valorfin.substr(0, 10));

  var newId = new mongoose.mongo.ObjectId(req.body.id);

  mongoose.model('PurchaseOrder')
    .aggregate(
      [
       {
         '$match': {
           date: {$gte:start, $lte:end},
           fk_Provider:newId // ID DE LA CATEGORIA SERVICIO OBRA PUBLICA
         }
       },
       {'$group' : {
          _id : '$fk_Category',
          import: { $sum: '$import' },
          contracts: { $sum: '$numberOfContracts'}
          }
      }
     ])
    .exec(function(err,result){
      mongoose.model('Category').populate(result, { path: '_id' }, function(err, populatedTransactions) {
          result=populatedTransactions.map(function(result){
            return {
              'nombre':result._id.category,
              'importe':result.import,
              'contratos': result.contracts
            }
          });
         res.send(result);
      });
    });
});

// Detail month
router.post('/api/post-detailMonth', function(req, res) {
  var anio = req.body.anio;
  anio = anio.toString();
  var newId = new mongoose.mongo.ObjectId(req.body.id);

  mongoose.model('PurchaseOrder')
    .aggregate([
      {
        '$match': {
          year: anio,
          fk_Provider:newId
        }
      },
      {
        '$group' : {
          _id: '$month',
          import: { $sum: '$import' },
          contracts: { $sum: '$numberOfContracts'}
        }
      }
    ])
    .exec(function(err,result){
      res.send(result);
    });
});

module.exports = router;
