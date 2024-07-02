const express = require("express");
const router = express.Router();

// import controllers
const {
  signUp,
  logIn,
  takeAction,
  getUsersAllData,
  getAllProducts,
  getAmountDetails,
  getTeam,
  getTimeData,
  changePassword,
} = require("../controllers/Auth");
const { auth, isPublic, isAdmin } = require("../middlewares/Auth");

const {
  privateRouteToken,
  validatePrivateRouteToken,
} = require("../controllers/PrivateRoute");

// Route for user Sign up
router.post("/sign-up", signUp);

// Route for user log in
router.post("/log-in", logIn);

// Route for product buy token
router.post("/product-buy-token", auth, isAdmin, privateRouteToken);

// Route for Validate Product buy token
router.post(
  "/validate-product-buy-token",
  auth,
  isPublic,
  validatePrivateRouteToken
);

router.post("/take-action", auth, isPublic, takeAction);
router.get("/user-details", auth, isPublic, getUsersAllData);

router.get("/fetch-all-products", auth, getAllProducts);
router.get("/fetch-amount-details", auth, getAmountDetails);

router.get("/get-team", auth, getTeam);
router.get("/get-times-data", auth, getTimeData);
router.post("/change-password", changePassword);

module.exports = router;
