var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose,2);
var Schema = mongoose.Schema;


// var provider = new mongoose.Schema({
//   grant_title: String,
//   cuil: Number,
//   total_amount: Number,
//   total_contrats: Number,
//   link: String,
//   detail: String
// });
// mongoose.model('yearProvider', provider);
//
//



var yearSchema = new mongoose.Schema({
  year: Number,
  numberOfContracts: Number,
  totalAmount: { type: Float }
});
mongoose.model('Year',yearSchema);


var providerSchema = new Schema({
  cuil: Number,
  grant_title: String
});
mongoose.model('Provider',providerSchema);

var categorySchema = new Schema({
  cod : String,
  category: String //reparticion
});
mongoose.model('Category',categorySchema);

var purchaseOrderSchema = new Schema({ //orden de compra
  year: String,
  month: String,
  date: Date,
  numberOfContracts: Number,//cantidad de contrataciones
  import: { type: Float },//importe
  fk_Provider: {type: Schema.ObjectId, ref: "Provider"},
  fk_Category: {type: Schema.ObjectId, ref: "Category"}
});
purchaseOrderSchema.plugin(mongoose_csv);
mongoose.model('PurchaseOrder',purchaseOrderSchema);