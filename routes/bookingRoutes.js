const express = require("express");
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  updateBookingStatus,
  cancelBooking,
  updateBookingDate
} = require("../controllers/bookingController");

const {
  verifyToken,
  allowRoles
} = require("../middleware/authMiddleware");

// USER ROUTES
router.post(
  "/",
  verifyToken,
  allowRoles(["user"]),
  createBooking
);

router.get(
  "/my-bookings",
  verifyToken,
  allowRoles(["user"]),
  getMyBookings
);

// USER: UPDATE BOOKING DATE
router.put(
  "/:id/date",
  verifyToken,
  allowRoles(["user"]),
  updateBookingDate
);

// USER: CANCEL BOOKING
router.put(
  "/:id/cancel",
  verifyToken,
  allowRoles(["user"]),
  cancelBooking
);

// OWNER ROUTES
router.get(
  "/owner",
  verifyToken,
  allowRoles(["owner"]),
  getOwnerBookings
);

router.put(
  "/:id/status",
  verifyToken,
  allowRoles(["owner"]),
  updateBookingStatus
);

module.exports = router;