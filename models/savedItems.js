const mongoose = require("mongoose");

const savedItemsSchema = mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
      required: true,
    },
    room: {
      type: String,
      required: true,
    },
    MOE_item: {
      type: String,
      ref: "CoreProductInfos",
      required: true,
    },

    designerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    liked: { type: Boolean, default: null },
  },
  { timestamps: true }
);
const SavedItems = mongoose.model("savedItems", savedItemsSchema);
module.exports = SavedItems;
