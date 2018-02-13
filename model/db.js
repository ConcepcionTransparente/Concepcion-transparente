var mongoose = require('mongoose');

// mongoose.connect('mongodb://127.0.0.1:27017/dcu?socketTimeoutMS=90000', function(err, db) {
//     if (err) {
//         console.log('Unable to connect to the server. Please start the server.', err);
//     } else {
//         console.log('Connected to Server successfully');
//     }
// });

mongoose.connect(
  // TODO: Evaluar si esto podría estar en la variable de entorno
  process.env.MONGODB_URI + '?socketTimeoutMS=90000',
  function(err, db) {
    if (err) {
      console.log('Unable to connect to the server. Please start the server.', err);
    } else {
      console.log('Connected to Server successfully');
    }
  }
);

// var MongoClient = require('mongodb').MongoClient
//     , format = require('util').format;
// MongoClient.connect('mongodb://127.0.0.1:27017/dcu', function (err, db) {
//     if (err) {
//         throw err;
//     } else {
//         console.log("successfully connected to the database DO");
//     }
//     db.close();
// });

// var MongoClient = require('mongodb').MongoClient;
//
// var uri = "mongodb://concepciontransparente:genosha@cluster0-shard-00-00-z1nxi.mongodb.net:27017,cluster0-shard-00-01-z1nxi.mongodb.net:27017,cluster0-shard-00-02-z1nxi.mongodb.net:27017/dcu?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin";
// MongoClient.connect(uri, function(err, db) {
//       if (err) {
//           console.log('Unable to connect to the server. Please start the server.', err);
//       } else {
//           console.log('Connected to Server successfully');
//       }
// });
