var mongoose = require('mongoose');

var provider = new mongoose.Schema({
  grant_title: String,
  cuil: Number,
  total_amount: Number,
  link: String,
  detail: String
});
mongoose.model('yearProvider', provider);


var year = new mongoose.Schema({
  year: Number,
  numberOfContracts: Number,
  total_amount: Number
});
mongoose.model('year',year);
