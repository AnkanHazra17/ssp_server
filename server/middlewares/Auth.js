const jwt = require("jsonwebtoken");
require("dotenv").config();

// Auth moddleWare
exports.auth = async (req, res, next) => {
  try {
    let token = "";

    if (req.cookies.token) {
      token = req.cookies.token;
    } else if (req.body.token) {
      token = req.body.token;
    } else if (req.header("Authorization")) {
      token = req.header("Authorization").replace("Bearer ", "");
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }

    // Verify the token
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decode;
    } catch (error) {
      console.log(error);
      return res.status(401).json({
        success: false,
        message: "Token is invalide",
      });
    }

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while validating token",
    });
  }
};

// Public middleware
exports.isPublic = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Public") {
      return res.status(401).json({
        success: false,
        message: "This is protected route for Public",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "User roal cannot be defined, please try again later",
    });
  }
};

// Admin middleware
exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is protected route for Admin",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "User roal cannot be defined, please try again later",
    });
  }
};
