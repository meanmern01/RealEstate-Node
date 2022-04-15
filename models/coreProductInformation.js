const mongoose = require("mongoose");

const coreProductInfoSchema = mongoose.Schema(
  {
    MOE_item: { type: String, required: true },
    MOE_productName: { type: String, required: true },
    UPC: {
      type: String,
      required: true,
    },
    Materials: [{ type: String }],
    dimension: {
      width: String,
      depth: String,
      height: String,
      weight: String,
      fourthDimension: String,
    },
    grouping: {
      color: String,
      category: String,
      style: String,
    },
    warrantyCompliance: {
      proposition65Compliance: String,
      proposition65Chemical: String,
      warranty: String,
      moeHospitalityApproved: String,
      countryOfManufacture: String,
    },
    SEO: {
      shortDescription: String,
      featuresBenefits: [{ type: String }],

      longWebDescription: String,
      searchKeywords: String,
    },
    productImagesLinks: { type: Array },
  },
  { timestamps: true }
);
const CoreProductInfo = mongoose.model(
  "CoreProductInfo",
  coreProductInfoSchema
);
module.exports = CoreProductInfo;
