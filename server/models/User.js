const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,

  role: {
    type: String,
    enum: ["user", "owner", "admin"],
    default: "user"
  },

  dob: String,
  gender: String,
  wilayat: String,

  otp: String,
  otpExpires: Date
});

module.exports = mongoose.model("User", userSchema);