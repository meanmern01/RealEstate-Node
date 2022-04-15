const mongoose = require("mongoose");

const SalesTaxSchema = mongoose.Schema(
  {
    state: { type: String, required: true },
    city: { type: String, required: true },
    zipcode: { type: String, required: true },
    taxes: [{ type: Object }],
  },
  { timestamps: true }
);
const SalesTax = mongoose.model("salesTax", SalesTaxSchema);
module.exports = SalesTax;
