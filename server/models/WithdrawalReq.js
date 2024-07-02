const mongoose = require("mongoose");

const withdrawalReqSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  upi: {
    type: String,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "Pending",
    enum: ["Pending", "Approved", "Rejected"],
  },
});

module.exports = mongoose.model("WithdrawalReq", withdrawalReqSchema);
