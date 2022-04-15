const mongoose = require("mongoose");

const productPricingSchema = mongoose.Schema(
  {
    MOE_item: { type: String, required: true },
    MOE_productName: { type: String, required: true },
    UPC: {
      type: String,
      required: true,
    },
    QtyinSet: { type: String },
    ECommerceCost: { type: String },
    Map: { type: String },
    PriceUnit: { type: String },
  },
  { timestamps: true }
);
const ProductPricing = mongoose.model("productPricing", productPricingSchema);
module.exports = ProductPricing;
