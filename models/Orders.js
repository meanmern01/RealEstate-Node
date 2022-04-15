const mongoose = require("mongoose");

const OrderSchema = mongoose.Schema(
  {
    buyerId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
    // price: { type: String, required: true },
    MOE_ITEM: { type: String, required: true },
    projectId: { type: String },
    quantity: { type: Number, required: true },
    payment: { type: String, default: "done" },
    charge_id: { type: String, default: null },
    delivered: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const Order = mongoose.model("order", OrderSchema);
module.exports = Order;
