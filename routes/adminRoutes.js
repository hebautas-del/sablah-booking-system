
const express = require("express");
const router = express.Router();

// Import admin controller functions
const {
  getAllUsers,
  deleteUser,
  getAllSablahs,
  deleteSablah
} = require("../controllers/adminController");

// Import authentication and authorization middleware
const {
  verifyToken,
  allowRoles
} = require("../middleware/authMiddleware");

// ==========================================
// ADMIN ACCESS PROTECTION
// ==========================================

// All routes below require a valid token and Admin role.
router.use(verifyToken, allowRoles(["admin"]));

// ==========================================
// USERS MANAGEMENT
// ==========================================

// Get all registered users.
router.get("/users", getAllUsers);

// Delete a selected user.
router.delete("/users/:id", deleteUser);

// ==========================================
// SABLAH MANAGEMENT
// ==========================================

// Get all sablah listings with owner information.
router.get("/sablahs", getAllSablahs);

// Delete a selected sablah.
router.delete("/sablahs/:id", deleteSablah);

module.exports = router;
