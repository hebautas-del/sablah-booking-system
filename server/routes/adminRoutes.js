const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  deleteUser
} = require("../controllers/adminController");

const {
  verifyToken,
  isAdmin
} = require("../middleware/authMiddleware");

router.get("/users", verifyToken, isAdmin, getAllUsers);

router.delete("/users/:id", verifyToken, isAdmin, deleteUser);

module.exports = router;