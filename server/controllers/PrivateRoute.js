const User = require("../models/User");
const PRTOken = require("../models/ProtectedRouteToken");
const crypto = require("crypto");

exports.privateRouteToken = async (req, res) => {
  try {
    const email = req.body.email;

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({
        success: true,
        message: "Your email is not register with us",
      });
    }

    const token = crypto.randomUUID();
    const tokenCreate = await PRTOken.create({
      email: email,
      prtoken: token,
    });

    return res.status(200).json({
      success: true,
      message: "Please check your mail",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wromg while sending product buy mail",
    });
  }
};

exports.validatePrivateRouteToken = async (req, res) => {
  try {
    const { token } = req.body;
    const tokenRes = await PRTOken.find({ prtoken: token });
    if (!tokenRes) {
      return res.status(401).json({
        success: false,
        message: "Product buy token is invalide",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product buy token matched",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error occured while validating product buy token",
    });
  }
};
