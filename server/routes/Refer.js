const express = require("express");
const router = express.Router();

const { auth } = require("../middlewares/Auth");
const {
  generateReferUrl,
  acceptReferal,
  checkAddedMembers,
} = require("../controllers/Refer");

router.get("/get-referal-code", auth, generateReferUrl);

router.post("/accept-referal", acceptReferal);

router.get("/check-added-members", auth, checkAddedMembers);

module.exports = router;
