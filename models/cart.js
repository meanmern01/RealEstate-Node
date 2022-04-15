const mongoose = require("mongoose");

const cartSchema = mongoose.Schema(
  {
    buyerId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
    projectId: { type: String },
    MOE_ITEM: { type: String, required: true },
    quantity: { type: Number, required: true },
    paid: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const Cart = mongoose.model("cart", cartSchema);
module.exports = Cart;
