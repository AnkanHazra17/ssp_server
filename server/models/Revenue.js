const mongoose = require("mongoose");

const revenueSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "Admin",
  },
  minAmount: {
    type: Number,
  },
  maxAmount: {
    type: Number,
  },
  withdrawalTax: {
    type: Number,
  },
  dipositeTax: {
    type: Number,
  },
  inviteBonus: {
    type: Number,
  },
  levelOneBouns: {
    type: Number,
  },
  levelTwoBonus: {
    type: Number,
  },
  levelThreeBonus: {
    type: Number,
  },
  totalRevenue: {
    type: Number,
  },
  withdrawTime: {
    start: {
      type: Date,
    },
    end: {
      type: Date,
    },
  },
  callTime: {
    start: {
      type: Date,
    },
    end: {
      type: Date,
    },
  },
  withdrawalRequest: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WithdrawalReq",
    },
  ],
  dailyRevenue: [
    {
      amount: {
        type: Number,
      },
      date: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
});

module.exports = mongoose.model("Revenue", revenueSchema);
