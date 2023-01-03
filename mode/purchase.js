const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const purchaseSchema = {
  userID: { type: String },
  cart: { type: Array },
  amount: { type: Number },
  date: { type: Date },
};

const Purchase = mongoose.model("Purchase", purchaseSchema);

module.exports = Purchase;
