const mongoose = require("mongoose");

const cartonInfoSchema = mongoose.Schema(
  {
    MOE_item: { type: String, required: true },
    MOE_productName: { type: String, required: true },
    UPC: {
      type: String,
      required: true,
    },
    QtyOfCarton_Item: { type: String },
    Carton1: {
      width: String,
      depth: String,
      height: String,
      weight: String,
    },
    Carton2: {
      width: String,
      depth: String,
      height: String,
      weight: String,
    },
    Carton3: {
      width: String,
      depth: String,
      height: String,
      weight: String,
    },
    Carton4: {
      width: String,
      depth: String,
      height: String,
      weight: String,
    },
    Carton5: {
      width: String,
      depth: String,
      height: String,
      weight: String,
    },
    Carton6: {
      width: String,
      depth: String,
      height: String,
      weight: String,
    },

    shippingMethod: { type: String },
    OverSizeSmallParcel: { type: String },
    LeadTime: { type: String },
    FreightClass: { type: String },
    CBM_ITEM: { type: String },
    CBF_ITEM: { type: String },
  },
  { timestamps: true }
);
const CartonInfo = mongoose.model("CartonInfo", cartonInfoSchema);
module.exports = CartonInfo;
