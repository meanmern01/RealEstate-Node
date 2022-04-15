const mongoose = require("mongoose");
const moment = require("moment");

const EmailNotificationSchema = mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    // price: { type: String, required: true },
    receiverEmail: { type: String, required: true },
    action: { type: String, required: true },
    sendTime: { type: Date, default: moment() },
  },
  { timestamps: true }
);
const EmailNotification = mongoose.model(
  "EmailNotification",
  EmailNotificationSchema
);
module.exports = EmailNotification;
