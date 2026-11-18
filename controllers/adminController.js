
const mongoose = require("mongoose");
const User = require("../models/User");
const Sablah = require("../models/Sablah");

// ==========================================
// USERS MANAGEMENT
// ==========================================

// GET ALL USERS — ADMIN ONLY
// Retrieve all registered users without exposing passwords or OTP data.
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -otp -otpExpires")
      .sort({ createdAt: -1 });

    return res.status(200).json(users);
  } catch (err) {
    console.error("Get All Users Error:", err);

    return res.status(500).json({
      message: "Failed to retrieve users"
    });
  }
};

// DELETE USER — ADMIN ONLY
// Delete a user account while protecting the current admin and other admin accounts.
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check whether the provided user ID is valid.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID"
      });
    }

    // Prevent the admin from deleting their own account.
    if (id === req.user.id) {
      return res.status(400).json({
        message: "Admin cannot delete their own account"
      });
    }

    // Find the user before attempting deletion.
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Protect other admin accounts from deletion.
    if (user.role === "admin") {
      return res.status(403).json({
        message: "Admin accounts cannot be deleted here"
      });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      message: "User deleted successfully"
    });
  } catch (err) {
    console.error("Delete User Error:", err);

    return res.status(500).json({
      message: "Failed to delete user"
    });
  }
};

// ==========================================
// SABLAH MANAGEMENT
// ==========================================

// GET ALL SABLAHS — ADMIN ONLY
// Retrieve all sablah listings and display their owners' basic information.
exports.getAllSablahs = async (req, res) => {
  try {
    const sablahs = await Sablah.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(sablahs);
  } catch (err) {
    console.error("Get All Sablahs Error:", err);

    return res.status(500).json({
      message: "Failed to retrieve sablahs"
    });
  }
};

// DELETE SABLAH — ADMIN ONLY
// Remove a sablah listing from the database.
exports.deleteSablah = async (req, res) => {
  try {
    const { id } = req.params;

    // Check whether the provided sablah ID is valid.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid sablah ID"
      });
    }

    // Find and delete the selected sablah.
    const sablah = await Sablah.findByIdAndDelete(id);

    if (!sablah) {
      return res.status(404).json({
        message: "Sablah not found"
      });
    }

    return res.status(200).json({
      message: "Sablah deleted successfully"
    });
  } catch (err) {
    console.error("Delete Sablah Error:", err);

    return res.status(500).json({
      message: "Failed to delete sablah"
    });
  }
};
