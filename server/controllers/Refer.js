const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Generete and send referal url
exports.generateReferUrl = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Please Check Your Mail",
      referalUrl: `https://dlftrade.in/accept-referal/${id}`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending refaral link",
    });
  }
};

// Check brpker level
const brokerLevelCheck = async (sender) => {
  const allClield =
    sender.levelOneChield.length +
    sender.levelTwoChild.length +
    sender.levelThreeChild.length;
  if (
    sender.levelOneChield.length >= 7 &&
    sender.levelOneChield.length < 12 &&
    allClield >= 30 &&
    allClield < 65
  ) {
    sender.brokerLevel = "vip_1";
  } else if (
    sender.levelOneChield.length >= 12 &&
    sender.levelOneChield.length < 25 &&
    allClield >= 65 &&
    allClield < 150
  ) {
    sender.brokerLevel = "vip_2";
  } else if (
    sender.levelOneChield.length >= 25 &&
    sender.levelOneChield.length < 38 &&
    allClield >= 150 &&
    allClield < 280
  ) {
    sender.brokerLevel = "vip_3";
  } else if (
    sender.levelOneChield.length >= 38 &&
    sender.levelOneChield.length < 50 &&
    allClield >= 280 &&
    allClield < 650
  ) {
    sender.brokerLevel = "vip_4";
  } else if (
    sender.levelOneChield.length >= 50 &&
    sender.levelOneChield.length < 62 &&
    allClield >= 650 &&
    allClield < 1300
  ) {
    sender.brokerLevel = "vip_5";
  } else if (sender.levelOneChield.length >= 62 && allClield >= 1300) {
    sender.brokerLevel = "vip_6";
  }

  await sender.save();
};

// Except referal
exports.acceptReferal = async (req, res) => {
  try {
    const { referCode, userName, email, phoneNo, password, confirmPassword } =
      req.body;

    if (
      !referCode ||
      !userName ||
      !email ||
      !password ||
      !confirmPassword ||
      !phoneNo
    ) {
      return res.status(400).json({
        success: false,
        message: "All Fields Are Required",
      });
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneNo)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and ConfirmPassword Not match",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "user already registered with us",
        existingUser,
      });
    }

    const sender = await User.findById(referCode).select("-password");
    if (!sender) {
      return res.status(400).json({
        success: false,
        message: "Sender Id is not valied",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      userName,
      email,
      phone: phoneNo,
      password: hashedPassword,
      parent: referCode,
      withrawalAmount: 0,
    });

    if (!sender.isGetWeekySalary) {
      if (
        !sender.membersAdded.some((member) => member.memberId.equals(user._id))
      ) {
        sender.membersAdded.push({ memberId: user._id });
      }
    }

    if (!sender.levelOneChield.includes(user._id)) {
      sender.levelOneChield.push(user._id);
    }

    await sender.save();

    // Senders parent
    const sendersParent = await User.findById(sender?.parent).select(
      "-password"
    );
    if (sendersParent) {
      if (!sendersParent.levelTwoChild.includes(user._id)) {
        sendersParent.levelTwoChild.push(user._id);
      }

      await sendersParent.save();

      // broker level check for senders parent
      brokerLevelCheck(sendersParent);

      // Senders Parents parent
      const sendersGrandParent = await User.findById(
        sendersParent.parent
      ).select("-password");
      if (sendersGrandParent) {
        if (!sendersGrandParent.levelThreeChild.includes(user._id)) {
          sendersGrandParent.levelThreeChild.push(user._id);
        }

        await sendersGrandParent.save();

        // broker level check for senders Parents parent
        brokerLevelCheck(sendersGrandParent);
      }
    }

    // Broker Lavel
    brokerLevelCheck(sender);

    return res.status(200).json({
      success: true,
      message: "Referal eccpted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error Occured while accepting referal",
    });
  }
};

const updateWeeklySalaryStatus = async (userId, status) => {
  try {
    await User.findByIdAndUpdate(userId, {
      "getWeekySalary.isGetWeeklySalary": status,
      "getWeekySalary.weeklySalaryUpdatedAt": status ? new Date() : null,
    });
  } catch (err) {
    console.error("Error updating weekly salary status:", err);
  }
};

// Check for added members
exports.checkAddedMembers = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const pipeline = [
      // Unwind the membersAdded array
      { $unwind: "$membersAdded" },
      // Match documents where dateAdded is within the last week
      { $match: { "membersAdded.dateAdded": { $gte: oneWeekAgo } } },
      // Group by null to get a count of all matched documents
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ];

    const results = await User.aggregate(pipeline).exec();
    const addedMembersLastWeek = results.length > 0 ? results[0].count : 0;

    if (user.brokerLevel === "vip_1") {
      if (!user.getWeekySalary.isGetWeeklySalary) {
        if (addedMembersLastWeek >= 2) {
          user.withrawalAmount += 700;
          updateWeeklySalaryStatus(userId, true);
        }
      }
    } else if (user.brokerLevel === "vip_2") {
      if (!user.getWeekySalary.isGetWeeklySalary) {
        if (addedMembersLastWeek >= 5) {
          user.withrawalAmount += 1000;
          updateWeeklySalaryStatus(userId, true);
        }
      }
    } else if (user.brokerLevel === "vip_3") {
      if (!user.getWeekySalary.isGetWeeklySalary) {
        if (addedMembersLastWeek >= 8) {
          user.withrawalAmount += 2000;
          updateWeeklySalaryStatus(userId, true);
        }
      }
    } else if (user.brokerLevel === "vip_4") {
      if (!user.getWeekySalary.isGetWeeklySalary) {
        if (addedMembersLastWeek >= 10) {
          user.withrawalAmount += 3000;
          updateWeeklySalaryStatus(userId, true);
        }
      }
    } else if (user.brokerLevel === "vip_5") {
      if (!user.getWeekySalary.isGetWeeklySalary) {
        if (addedMembersLastWeek >= 15) {
          user.withrawalAmount += 5000;
          updateWeeklySalaryStatus(userId, true);
        }
      }
    } else if (user.brokerLevel === "vip_6") {
      if (!user.getWeekySalary.isGetWeeklySalary) {
        if (addedMembersLastWeek >= 18) {
          user.withrawalAmount += 20000;
          updateWeeklySalaryStatus(userId, true);
        }
      }
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Broker salary updated",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error occured while checking for added members",
    });
  }
};
