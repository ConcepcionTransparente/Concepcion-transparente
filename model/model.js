var mongoose = require('mongoose');
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
  totalAmount: String
},{
   timestamps: true
});
mongoose.model('Year',yearSchema);


var providerSchema = new Schema({
  cuil: Number,
  grant_title: String
}),{
   timestamps: true
};
mongoose.model('Provider',providerSchema);

var categorySchema = new Schema({
  cod : String,
  category: String //reparticion
},{
   timestamps: true
});
mongoose.model('Category',categorySchema);

var purchaseOrderSchema = new Schema({ //orden de compra
  year: String,
  month: String,
  numberOfContracts: Number,//cantidad de contrataciones
  import: String,//importe
  fk_Provider: {type: Schema.ObjectId, ref: "Provider"},
  fk_Category: {type: Schema.ObjectId, ref: "Category"}
},{
   timestamps: true
});
mongoose.model('PurchaseOrder',purchaseOrderSchema);
