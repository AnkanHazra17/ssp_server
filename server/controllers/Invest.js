const crypto = require("crypto");
const User = require("../models/User");
const Revenue = require("../models/Revenue");
const { withrawalEmail } = require("../mail-temp/withrawalMail");
const WithdrawalReq = require("../models/WithdrawalReq");
const Paymenthistory = require("../models/PaymentHistory");

// After Payment call This Function

exports.afterPaymentActions = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;
    if (!userId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Please Provide Required data",
      });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const revenue = await Revenue.findOne({ name: "Admin" });
    if (!revenue) {
      return res.status(404).json({
        success: false,
        message: "Revenue Not found",
      });
    }

    const paymentHistory = await Paymenthistory.create({ amount: amount });

    const dipositTax = revenue.dipositeTax;
    const decrese = (amount * dipositTax) / 100;
    const userAmount = amount - decrese;
    user.withrawalAmount += userAmount;
    user.paymmentHistory.push(paymentHistory._id);
    await user.save();

    const { levelOneBouns, levelTwoBonus, levelThreeBonus } = revenue;

    // Update Users Parent
    const usersParentId = user?.parent;
    const usersParent = await User.findById(usersParentId).select("-password");
    if (usersParent) {
      if (!usersParent.levelOneCommision) {
        const one_money = amount * (levelOneBouns / 100);
        usersParent.withrawalAmount += one_money;
        usersParent.levelOneCommision = true;
        await usersParent.save();
      }

      const levelTwoParentId = usersParent?.parent;
      const levelTwoParent = await User.findById(levelTwoParentId).select(
        "-password"
      );
      if (levelTwoParent) {
        if (!levelTwoParent.levelTwoCommision) {
          const two_money = amount * (levelTwoBonus / 100);
          levelTwoParent.withrawalAmount += two_money;
          levelTwoParent.levelTwoCommision = true;
          await levelTwoParent.save();
        }

        const levelThreeParentId = levelTwoParent?.parent;
        const levelthreeParent = await User.findById(levelThreeParentId).select(
          "-password"
        );
        if (levelthreeParent) {
          if (!levelthreeParent.levelThreeCommition) {
            const three_money = amount * (levelThreeBonus / 100);
            levelthreeParent.withrawalAmount += three_money;
            levelthreeParent.levelThreeCommition = true;
            await levelthreeParent.save();
          }
        }
      }
    }

    revenue.totalRevenue += amount;
    revenue.dailyRevenue.push({ amount: amount });
    await revenue.save();

    return res.status(200).json({
      success: true,
      message: "Payment sccessfull",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "After Payment Actions failed",
    });
  }
};

exports.withrawalRequest = async (req, res) => {
  try {
    const { upi, amount } = req.body;
    const userId = req.user.id;

    if (!upi || !amount) {
      return res.status(400).json({
        success: false,
        message: "Please Provide Required Data",
      });
    }

    // const currentTime = new Date();

    const revenue = await Revenue.findOne({ name: "Admin" });
    if (!revenue) {
      return res.status(404).json({
        success: false,
        message: "Revenue Not Found",
      });
    }

    // if (
    //   currentTime < revenue.withdrawTime.start ||
    //   currentTime > revenue.withdrawTime.end
    // ) {
    //   return res.status(200).json({
    //     success: false,
    //     message: "You are not allowed to withdraw at this monent",
    //   });
    // }

    const admin = await User.findOne({ accountType: "Admin" }).select(
      "-password"
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const totalAmount = user.withrawalAmount;

    if (amount > totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Your total savings is less than your requested amount",
      });
    }

    const withdrawalDetails = await Revenue.findOne({ name: "Admin" });
    if (!withdrawalDetails) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal Details Not Found",
      });
    }

    if (
      amount < withdrawalDetails.minAmount ||
      amount > withdrawalDetails.maxAmount
    ) {
      return res.status(400).json({
        success: false,
        message: "Amount is invalide",
      });
    }

    const taxAmount = (amount * 6) / 100;
    const withdrawalAmount = amount - taxAmount;
    user.withrawalAmount -= amount;
    await user.save();

    const withdrawalreq = await WithdrawalReq.create({
      userName: user.userName,
      phone: user.phone,
      upi: upi,
      amount: withdrawalAmount,
      totalAmount: amount,
    });

    withdrawalDetails.withdrawalRequest.push(withdrawalreq._id);
    await withdrawalDetails.save();

    user.withdrawalHistry.push(withdrawalreq._id);
    user.save();

    return res.status(200).json({
      success: true,
      message: "Withrawal request sent successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went while withrawaling money",
    });
  }
};

exports.initializePayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;
    const reqId = generateNumericId(12);
    const paymentReq = await PaymentReqId.create({ payReqId: reqId });

    if (!paymentReq) {
      return res.status(400).json({
        success: false,
        message: "Error creating payment reqId",
      });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    const landingPage = "sspports.xyz/payment-confirmation/cnfpaymt";
    const apiKey = "9be4fb91637e6defbee72f3b4923687949099";

    const url = `https://apihome.in/panel/api/payin_intent/?key=${apiKey}&amount=${amount}&reqid=${reqId}&rdrct=${landingPage}`;

    const paymentResponse = await axios.get(url);

    return res.status(200).json({
      success: true,
      message: "Transaction under process",
      paymentResponse,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error initializing payment",
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const reqid = req.query.reqid;
    const amount = req.query.am;
    const status = req.query.status;
    const utr = req.query.utr;

    if (!userId || !reqid || !amount || !status) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (status === "FAILED") {
      return res.status(400).json({
        success: false,
        message: "Payment Failed",
      });
    }

    const user = await User.findById(userId)
      .select("-password")
      .populate("paymentReq");

    if (reqid !== user.paymentReq.payReqId) {
      await PaymentReqId.findByIdAndDelete(user.paymentReq._id);
      return res.status(200).json({
        success: true,
        message: "Payment verification failed",
      });
    }

    // await afterPaymentActions(amount, userId);
    await PaymentReqId.findByIdAndDelete(user.paymentReq._id);

    return res.status(200).json({
      success: true,
      message: "Payment verified",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error verifing payment",
    });
  }
};

// exports.paymentTest = async (req, res) => {
//   try {
//     const { amount } = req.body;
//     const userId = req.user.id;

//     await afterPaymentActions(amount, userId, res);

//     return res.status(200).json({
//       success: true,
//       message: "Payment successfull",
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       success: false,
//       message: "Payment failed",
//     });
//   }
// };
