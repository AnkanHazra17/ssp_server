const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema({
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  withdrawalReq: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WithdrawalReq",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Withdraw", withdrawalSchema);
