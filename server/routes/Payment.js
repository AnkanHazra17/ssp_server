const express = require("express");
const router = express.Router();

const { auth, isPublic, isAdmin } = require("../middlewares/Auth");
const {
  withrawalRequest,
  initializePayment,
  verifyPayment,
  paymentTest,
  afterPaymentActions,
} = require("../controllers/Invest");

router.post("/init-payment", auth, isPublic, initializePayment);
router.post("/withraw-money", auth, isPublic, withrawalRequest);
router.post("/verify-payment", auth, isPublic, verifyPayment);
// router.post("/payment-test", auth, isPublic, paymentTest);
router.post("/pay-process", auth, isPublic, afterPaymentActions);

module.exports = router;
