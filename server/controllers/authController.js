// 📁 backend/controllers/authController.js

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");

/* ================= FORGOT PASSWORD ================= */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.otp = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000;

  await user.save();

  await sendEmail(email, "OTP Code", `Your OTP is: ${otp}`);

  res.json({ message: "OTP sent to email" });
};


/* ================= VERIFY OTP ================= */
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  if (user.otpExpires < Date.now()) {
    return res.status(400).json({ message: "OTP expired" });
  }

  res.json({ message: "OTP verified" });
};


/* ================= RESET PASSWORD ================= */
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  user.password = await bcrypt.hash(newPassword, 10);
  user.otp = null;
  user.otpExpires = null;

  await user.save();

  res.json({ message: "Password reset successful" });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, dob, gender, wilayat } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      dob,
      gender,
      wilayat
    });

    res.status(201).json({ message: "Registered successfully", user });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      token: "demo-token",
      name: user.name,
      role: user.role
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};