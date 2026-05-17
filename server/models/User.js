const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,

  role: {
    type: String,
    enum: ["user", "owner", "admin"],
    default: "user"
  },

  // USER FIELDS
  dob: String,
  gender: String,
  wilayat: String,

  // OWNER FIELDS
  businessName: String,
  sablahNameEn: String,
  sablahNameAr: String,
  area: String,
  capacity: String,
  price: String,
  address: String,
  descriptionEn: String,
  descriptionAr: String,
  amenities: String,

  otp: String,
  otpExpires: Date
});

module.exports = mongoose.model("User", userSchema);