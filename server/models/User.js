const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    accountType: {
      type: String,
      required: true,
      default: "Public",
      enum: ["Admin", "Public"],
    },
    levelOneCommision: {
      type: Boolean,
      default: false,
    },
    levelTwoCommision: {
      type: Boolean,
      default: false,
    },
    levelThreeCommition: {
      type: Boolean,
      default: false,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    withrawalAmount: {
      type: Number,
    },
    getWeekySalary: {
      isGetWeeklySalary: {
        type: Boolean,
        default: false,
      },
      weeklySalaryUpdatedAt: {
        type: Date,
      },
    },
    membersAdded: [
      {
        memberId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        dateAdded: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    levelOneChield: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    levelTwoChild: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    levelThreeChild: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    brokerLevel: {
      type: String,
      default: "none",
      enum: ["none", "vip_1", "vip_2", "vip_3", "vip_4", "vip_5", "vip_6"],
    },
    paymmentHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PaymentHistory",
      },
    ],
    withdrawalHistry: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WithdrawalReq",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
