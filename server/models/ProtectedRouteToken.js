const mongoose = require("mongoose");

const prtSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  prtoken: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 3 * 60 * 60,
  },
});

module.exports = mongoose.model("Prtoken", prtSchema);
