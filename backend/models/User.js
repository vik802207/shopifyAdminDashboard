const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,

  role: {
    type: String,
    enum: ["admin", "seller"],
    required: true
  },

  status: {
    type: String,
    enum: ["active", "blocked"],
    default: "active"
  },

  shopDomain: String,
  shopifyAccessToken: String,
  facebookAdAccountId: String,
  googleCustomerId: String

}, { timestamps: true });

module.exports = mongoose.model("ScalemintUser", userSchema);
