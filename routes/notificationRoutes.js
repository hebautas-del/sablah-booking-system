
const express = require("express");
const router = express.Router();

const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require("../controllers/notificationController");

const {
  verifyToken,
  allowRoles
} = require("../middleware/authMiddleware");

// GET MY NOTIFICATIONS
router.get(
  "/",
  verifyToken,
  allowRoles(["user", "owner"]),
  getMyNotifications
);

// MARK ALL AS READ
router.put(
  "/read-all",
  verifyToken,
  allowRoles(["user", "owner"]),
  markAllAsRead
);

// MARK ONE AS READ
router.put(
  "/:id/read",
  verifyToken,
  allowRoles(["user", "owner"]),
  markAsRead
);

// DELETE NOTIFICATION
router.delete(
  "/:id",
  verifyToken,
  allowRoles(["user", "owner"]),
  deleteNotification
);

module.exports = router;
