const User = require("../models/User");
const Revenue = require("../models/Revenue");
const Product = require("../models/Product");
const Withdraw = require("../models/WithdrawalTime");
const withdrawalReq = require("../models/WithdrawalReq");
const PaymentHistory = require("../models/PaymentHistory");

exports.allUsersFulldata = async (req, res) => {
  try {
    const users = await User.find({
      accountType: { $ne: "Admin" },
    })
      .select("-password -membersAdded")
      .populate(
        "parent levelOneChield levelTwoChild levelThreeChild",
        "userName email phone"
      )
      .populate("paymmentHistory withdrawalHistry");

    if (!users) {
      return res.status(404).json({
        success: false,
        message: "Users Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "All users data fetched successfully",
      users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error occured while fethcing all users data",
    });
  }
};

exports.getRevenueDetails = async (req, res) => {
  try {
    const revenue = await Revenue.findOne({ name: "Admin" });
    if (!revenue) {
      return res.status(404).json({
        success: false,
        message: "Revenue details not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Revenue details found",
      revenue,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error occured while fetching revenue details",
    });
  }
};

exports.createRevenue = async (req, res) => {
  try {
    const { total } = req.body;
    const revenue = await Revenue.create({
      totalRevenue: total,
    });

    return res.status(200).json({
      success: true,
      message: "Revenue initialized",
      revenue,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error occured while initializing revenue",
    });
  }
};

exports.createProducts = async (req, res) => {
  try {
    const { name, price, change, rise, call } = req.body;

    if (!name || !price || !change) {
      return res.status(400).json({
        success: false,
        message: "Please Provide Required Data",
      });
    }

    const existingProduct = await Product.findOne({ name: name });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product already exists",
      });
    }

    const product = await Product.create({
      name: name,
      price: price,
      change: change,
      rise: rise,
      call: call,
    });
    return res.status(200).json({
      success: true,
      message: "Product Created Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error Occured While Creating Product",
    });
  }
};

exports.createCall = async (req, res) => {
  try {
    const { call } = req.body;
    const { productId } = req.query;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found",
      });
    }
    product.call = call;
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Call Created",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error Occured while creating call",
    });
  }
};

exports.editProducts = async (req, res) => {
  try {
    const { name, price, change, rise, call } = req.body;
    const { productId } = req.query;

    if (
      !name ||
      !price ||
      !change ||
      rise === undefined ||
      call === undefined ||
      !productId
    ) {
      return res.status(400).json({
        success: false,
        message: "All Fields are required",
      });
    }

    const existingProduct = await Product.findOne({ name: name });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product Exists",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found",
      });
    }

    product.name = name;
    product.price = price;
    product.rise = rise;
    product.change = change;
    product.call = call;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product Updated Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error Occured While Updating Product",
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Please Provide required data",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found",
      });
    }

    await Product.findByIdAndDelete(productId);

    return res.status(200).json({
      success: true,
      message: "Product Deleted",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error Occured While deleting Product",
    });
  }
};

exports.setTime = async (req, res) => {
  try {
    const { withStartTime, withEndTime, callStartTime, callEndTime } = req.body;
    if (!withStartTime || !withEndTime || !callStartTime || !callEndTime) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const revenue = await Revenue.findOne({ name: "Admin" });
    if (!revenue) {
      return res.status(404).jsoon({
        success: false,
        message: "Revenue Data Not Found",
      });
    }

    revenue.withdrawTime.start = withStartTime;
    revenue.withdrawTime.end = withEndTime;
    revenue.callTime.start = callStartTime;
    revenue.callTime.end = callEndTime;
    await revenue.save();

    return res.status(200).json({
      success: true,
      message: "Time Setup successfull",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error Occured While Setting Withdrawal time",
    });
  }
};

exports.setAmount = async (req, res) => {
  try {
    const {
      minAmount,
      maxAmount,
      withdrawalTax,
      dipositeTax,
      inviteBonus,
      levelOneBonus,
      levelTwoBonus,
      levelThreeBonus,
    } = req.body;

    if (
      !minAmount ||
      !maxAmount ||
      !withdrawalTax ||
      !dipositeTax ||
      !inviteBonus ||
      !levelOneBonus ||
      !levelTwoBonus ||
      !levelThreeBonus
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide required data",
      });
    }

    const revenue = await Revenue.findOne({ name: "Admin" });
    if (!revenue) {
      return res.status(404).json({
        success: false,
        message: "Revenue Not Found",
      });
    }

    revenue.minAmount = minAmount;
    revenue.maxAmount = maxAmount;
    revenue.withdrawalTax = withdrawalTax;
    revenue.dipositeTax = dipositeTax;
    revenue.inviteBonus = inviteBonus;
    revenue.levelOneBouns = levelOneBonus;
    revenue.levelTwoBonus = levelTwoBonus;
    revenue.levelThreeBonus = levelThreeBonus;
    await revenue.save();

    return res.status(200).json({
      success: true,
      message: "Withdrawal Amount Set Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error Occured While Updating withrawal amount",
    });
  }
};

exports.getWithdrawalRequests = async (req, res) => {
  try {
    const revenue = await Revenue.find({ name: "Admin" }).populate(
      "withdrawalRequest"
    );
    if (!revenue) {
      return res.status(404).json({
        success: false,
        message: "Revnue Details Not Found",
      });
    }

    const allRequest = await withdrawalReq.find();

    return res.status(200).json({
      success: true,
      message: "Withdrawal Requests Fetched SuccessFully",
      withdrawalReq: allRequest,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error Occured While Getting All Withdrawal Requests",
    });
  }
};

exports.approveWithdrawalRequest = async (req, res) => {
  try {
    const { requsetId } = req.query;

    const requset = await withdrawalReq.findByIdAndUpdate(
      { _id: requsetId },
      { status: "Approved" },
      { new: true }
    );

    if (!requset) {
      return res.status(400).json({
        success: false,
        message: "Request not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Request Approved",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error Occured While Approving Request Requests",
    });
  }
};

exports.rejectWithdrawalRequest = async (req, res) => {
  try {
    const { requsetId } = req.query;

    const requset = await withdrawalReq.findByIdAndUpdate(
      { _id: requsetId },
      { status: "Rejected" },
      { new: true }
    );

    if (!requset) {
      return res.status(400).json({
        success: false,
        message: "Request not found",
      });
    }

    const user = await User.findOne({ phone: requset.phone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    user.withrawalAmount += requset.totalAmount;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Request Rejected",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error Occured While Approving Request Requests",
    });
  }
};

exports.deleteLavelUsers = async (req, res) => {
  try {
    const { mainId, userId } = req.body;

    if (!mainId || !userId) {
      return res.status(400).json({
        success: false,
        message: "All Fields are required",
      });
    }

    const user = await User.findById(mainId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    if (user.levelOneChield.includes(userId)) {
      await User.findByIdAndUpdate(mainId, {
        $pull: { levelOneChield: userId },
      });
    } else if (user.levelTwoChild.includes(userId)) {
      await User.findByIdAndUpdate(mainId, {
        $pull: { levelTwoChild: userId },
      });
    } else if (user.levelThreeChild.includes(userId)) {
      await User.findByIdAndUpdate(mainId, {
        $pull: { levelThreeChild: userId },
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "This user not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Chiled deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error Occured While Deleting Child",
    });
  }
};

exports.allPaymentHistory = async (req, res) => {
  try {
    const paymentHistory = await PaymentHistory.find();

    if (!paymentHistory) {
      return res.status(404).json({
        success: false,
        message: "Payment history not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment history fetched successfully",
      paymentHistory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching payment history",
    });
  }
};

// Update users balance
exports.updateUserBalance = async (req, res) => {
  try {
    const { userId } = req.query;
    const { amount } = req.body;

    const user = await User.findByIdAndUpdate(userId, {
      withrawalAmount: amount,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Failed to update users balance",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Users balance updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error updating users balance",
    });
  }
};
