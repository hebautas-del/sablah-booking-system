
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { verifyToken } = require("../middleware/authMiddleware");

// Demo OTP storage
const otpStore = new Map();

// ================================
// FORGOT PASSWORD - SEND OTP
// ================================
router.post("/forgot-password", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // OTP expires after 5 minutes
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    // DEMO ONLY: do not return OTP in production
    res.json({
      message: "OTP generated successfully",
      otp
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
});

// ================================
// RESET PASSWORD - VERIFY OTP
// ================================
router.post("/reset-password", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, OTP, and new password are required"
      });
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters"
      });
    }

    const savedOtp = otpStore.get(email);

    if (
      !savedOtp ||
      savedOtp.expiresAt < Date.now() ||
      savedOtp.otp !== String(otp).trim()
    ) {
      otpStore.delete(email);

      return res.status(400).json({
        message: "Invalid or expired OTP"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      otpStore.delete(email);

      return res.status(404).json({
        message: "User not found"
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // OTP can only be used once
    otpStore.delete(email);

    res.json({
      message: "Password updated successfully"
    });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
});

// ================================
// UPDATE PROFILE - LOGGED-IN USER
// ================================
router.put("/update-profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const { name, email, phone, password } = req.body;

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          message: "Name cannot be empty"
        });
      }
      user.name = name.trim();
    }

    if (email !== undefined) {
      if (typeof email !== "string" || !email.trim()) {
        return res.status(400).json({
          message: "Valid email is required"
        });
      }

      user.email = email.trim().toLowerCase();
    }

    if (phone !== undefined) {
      user.phone = typeof phone === "string" ? phone.trim() : user.phone;
    }

    if (password !== undefined && password !== "") {
      if (typeof password !== "string" || password.length < 8) {
        return res.status(400).json({
          message: "Password must be at least 8 characters"
        });
      }

      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Update profile error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email is already registered"
      });
    }

    res.status(500).json({
      message: "Server error"
    });
  }
});

module.exports = router;
