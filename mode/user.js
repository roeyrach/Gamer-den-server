const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = {
  _id: { type: String },
  email: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  isAdmin: { type: Boolean },
  cart: { type: Array },
};

const User = mongoose.model("User", userSchema);

module.exports = User;
