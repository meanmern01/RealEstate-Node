const mongoose = require("mongoose");

const inventoryDetailsSchema = mongoose.Schema(
  {
    UPC_Code: { type: String, required: true },
    SKU: { type: String, required: true },
    Name: {
      type: String,
      required: true,
    },
    Stock_WA: { type: Number },
    Stock_NJ: { type: Number },
    ETA_WA: { type: String },
    ETA_NJ: { type: String },
    Remove: { type: String, default: "" },
  },
  { timestamps: true }
);
const InventoryDetails = mongoose.model(
  "InventoryDetails",
  inventoryDetailsSchema
);
module.exports = InventoryDetails;
