
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Sablah = require("../models/Sablah");
const Notification = require("../models/Notification");

// ========================================
// HELPER: CREATE BOOKING NOTIFICATION
// ========================================
const createBookingNotification = async ({
  recipient,
  type,
  title,
  message,
  booking
}) => {
  try {
    await Notification.create({
      recipient,
      type,
      title,
      message,
      booking
    });
  } catch (error) {
    // Notification failure should not affect booking operations
    console.error("Create Notification Error:", error);
  }
};


// ========================================
// CREATE BOOKING
// ========================================
exports.createBooking = async (req, res) => {
  try {
    const { sablahId, bookingDate, guests, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(sablahId)) {
      return res.status(400).json({
        message: "Invalid sablah ID."
      });
    }

    if (
      typeof bookingDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(bookingDate)
    ) {
      return res.status(400).json({
        message: "Please provide a valid booking date."
      });
    }

    const date = new Date(`${bookingDate}T00:00:00.000Z`);

    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== bookingDate
    ) {
      return res.status(400).json({
        message: "Invalid booking date."
      });
    }

    const today = new Date();
    const todayString =
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    if (bookingDate < todayString) {
      return res.status(400).json({
        message: "You cannot book a past date."
      });
    }

    const guestCount = Number(guests);

    if (!Number.isInteger(guestCount) || guestCount < 1) {
      return res.status(400).json({
        message: "Please enter a valid number of guests."
      });
    }

    const sablah = await Sablah.findById(sablahId);

    if (!sablah) {
      return res.status(404).json({
        message: "Sablah not found."
      });
    }

    if (sablah.owner.toString() === req.user.id) {
      return res.status(403).json({
        message: "You cannot book your own sablah."
      });
    }

    if (guestCount > sablah.capacity) {
      return res.status(400).json({
        message: `Maximum capacity is ${sablah.capacity} guests.`
      });
    }

    const existingBooking = await Booking.findOne({
      sablah: sablah._id,
      bookingDate: date,
      status: { $in: ["pending", "approved"] }
    });

    if (existingBooking) {
      return res.status(409).json({
        message: "This sablah is already booked on this date."
      });
    }

    const booking = await Booking.create({
      sablah: sablah._id,
      owner: sablah.owner,
      user: req.user.id,
      bookingDate: date,
      guests: guestCount,
      totalPrice: sablah.price,
      notes: typeof notes === "string" ? notes.trim() : "",
      status: "pending"
    });

    // Notify the owner about the new booking request
    await createBookingNotification({
      recipient: sablah.owner,
      type: "new_booking",
      title: "New Booking Request",
      message: `You have received a new booking request for ${sablah.nameEn || "your sablah"}.`,
      booking: booking._id
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate(
        "sablah",
        "nameEn nameAr governorate wilayat address image images price"
      )
      .populate("user", "name email phone")
      .populate("owner", "name email");

    return res.status(201).json({
      message: "Booking request submitted successfully.",
      booking: populatedBooking
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This sablah is already booked on this date."
      });
    }

    console.error("Create Booking Error:", error);

    return res.status(500).json({
      message: "Failed to create booking."
    });
  }
};


// ========================================
// GET USER'S BOOKINGS
// ========================================
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user.id
    })
      .populate(
        "sablah",
        "nameEn nameAr governorate wilayat address image images"
      )
      .populate("owner", "name email phone")
      .sort({ bookingDate: -1 });

    return res.status(200).json(bookings);

  } catch (error) {
    console.error("Get My Bookings Error:", error);

    return res.status(500).json({
      message: "Failed to retrieve your bookings."
    });
  }
};


// ========================================
// GET OWNER'S BOOKINGS
// ========================================
exports.getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      owner: req.user.id
    })
      .populate(
        "sablah",
        "nameEn nameAr governorate wilayat address image images"
      )
      .populate("user", "name email phone")
      .sort({ bookingDate: 1 });

    return res.status(200).json(bookings);

  } catch (error) {
    console.error("Get Owner Bookings Error:", error);

    return res.status(500).json({
      message: "Failed to retrieve bookings."
    });
  }
};


// ========================================
// UPDATE BOOKING STATUS (OWNER)
// ========================================
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid booking ID."
      });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid booking status."
      });
    }

    const booking = await Booking.findOneAndUpdate(
      {
        _id: id,
        owner: req.user.id,
        status: "pending"
      },
      {
        status
      },
      {
        new: true,
        runValidators: true
      }
    )
      .populate("sablah", "nameEn nameAr")
      .populate("user", "name email phone");

    if (!booking) {
      return res.status(404).json({
        message: "Pending booking not found."
      });
    }

    // Notify the user when the owner approves or rejects the booking
    await createBookingNotification({
      recipient: booking.user._id,
      type: status === "approved"
        ? "booking_approved"
        : "booking_rejected",
      title: status === "approved"
        ? "Booking Approved"
        : "Booking Rejected",
      message: status === "approved"
        ? `Your booking for ${booking.sablah?.nameEn || "the sablah"} has been approved.`
        : `Your booking for ${booking.sablah?.nameEn || "the sablah"} has been rejected.`,
      booking: booking._id
    });

    return res.status(200).json({
      message: `Booking ${status} successfully.`,
      booking
    });

  } catch (error) {
    console.error("Update Booking Status Error:", error);

    return res.status(500).json({
      message: "Failed to update booking status."
    });
  }
};


// ========================================
// CANCEL BOOKING (USER)
// ========================================
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid booking ID."
      });
    }

    const booking = await Booking.findOneAndUpdate(
      {
        _id: id,
        user: req.user.id,
        status: { $in: ["pending", "approved"] }
      },
      {
        status: "cancelled"
      },
      {
        new: true,
        runValidators: true
      }
    ).populate("sablah", "nameEn nameAr");

    if (!booking) {
      return res.status(404).json({
        message: "Active booking not found."
      });
    }

    // Notify the owner about the cancellation
    await createBookingNotification({
      recipient: booking.owner,
      type: "booking_cancelled",
      title: "Booking Cancelled",
      message: `A booking for ${booking.sablah?.nameEn || "your sablah"} has been cancelled by the user.`,
      booking: booking._id
    });

    return res.status(200).json({
      message: "Booking cancelled successfully.",
      booking
    });

  } catch (error) {
    console.error("Cancel Booking Error:", error);

    return res.status(500).json({
      message: "Failed to cancel booking."
    });
  }
};


// ========================================
// UPDATE BOOKING DATE (USER)
// ========================================
exports.updateBookingDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { bookingDate } = req.body;

    // Validate booking ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid booking ID."
      });
    }

    // Validate date format
    if (
      typeof bookingDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(bookingDate)
    ) {
      return res.status(400).json({
        message: "Please provide a valid booking date."
      });
    }

    const newDate = new Date(`${bookingDate}T00:00:00.000Z`);

    if (
      Number.isNaN(newDate.getTime()) ||
      newDate.toISOString().slice(0, 10) !== bookingDate
    ) {
      return res.status(400).json({
        message: "Invalid booking date."
      });
    }

    // Prevent past dates
    const today = new Date();
    const todayString =
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    if (bookingDate < todayString) {
      return res.status(400).json({
        message: "You cannot select a past date."
      });
    }

    // Find booking belonging to the logged-in user
    const booking = await Booking.findOne({
      _id: id,
      user: req.user.id,
      status: { $in: ["pending", "approved"] }
    });

    if (!booking) {
      return res.status(404).json({
        message: "Active booking not found. Rejected or cancelled bookings cannot be changed."
      });
    }

    // Check if another active booking already uses this date
    const existingBooking = await Booking.findOne({
      _id: { $ne: booking._id },
      sablah: booking.sablah,
      bookingDate: newDate,
      status: { $in: ["pending", "approved"] }
    });

    if (existingBooking) {
      return res.status(409).json({
        message: "This sablah is already booked on the selected date."
      });
    }

    // Update date and return approved bookings to pending
    booking.bookingDate = newDate;
    booking.status = "pending";

    await booking.save();

    // Notify the owner about the changed booking date
    await createBookingNotification({
      recipient: booking.owner,
      type: "booking_date_updated",
      title: "Booking Date Updated",
      message: `A booking date for your sablah has been changed to ${bookingDate}. Please review the request.`,
      booking: booking._id
    });

    const updatedBooking = await Booking.findById(booking._id)
      .populate(
        "sablah",
        "nameEn nameAr governorate wilayat address image images"
      )
      .populate("owner", "name email phone");

    return res.status(200).json({
      message: "Booking date updated successfully. The booking is now pending owner approval.",
      booking: updatedBooking
    });

  } catch (error) {
    // Handle duplicate booking caused by database unique index
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This sablah is already booked on the selected date."
      });
    }

    console.error("Update Booking Date Error:", error);

    return res.status(500).json({
      message: "Failed to update booking date."
    });
  }
};
