var mongoose = require('mongoose');

var provider = new mongoose.Schema({
  cuil: Number,
  grant_title: String,
  total_amount: Number
});
mongoose.model('yearProvider', provider);


var year = new mongoose.Schema({
  year: Number,
  numberOfContracts: Number,
  total_amount: Number
});
mongoose.model('year',year);
