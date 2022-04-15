const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: { type: String, required: true },
    role: { type: String, default: "designer" },
    active: { type: Boolean, default: true },
    address: {
      pointOfContact: { type: String },
      Contactphonenumber: { type: String },
      line1: { type: String },
      line2: { type: String },
      city: { type: String },
      state: { type: String },
      zipcode: { type: String },
      country: { type: String },
      shippingInstructions: { type: String },
    },
    stripe_customer_id: String,
    totalCommission: { type: Number, default: 0 },
    createdAt: Date,
  },
  { timestamps: true }
);
const Users = mongoose.model("Users", userSchema);
module.exports = Users;
