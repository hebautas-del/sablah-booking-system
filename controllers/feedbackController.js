
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Feedback = require("../models/Feedback");

// Submit feedback for an eligible booking
exports.submitFeedback = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        message: "Invalid booking ID"
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5"
      });
    }

    if (comment !== undefined && typeof comment !== "string") {
      return res.status(400).json({
        message: "Comment must be text"
      });
    }

    const cleanComment = (comment || "").trim();

    if (cleanComment.length > 1000) {
      return res.status(400).json({
        message: "Comment cannot exceed 1000 characters"
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user.id
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    if (booking.status !== "approved") {
      return res.status(400).json({
        message: "Only approved bookings can receive feedback"
      });
    }

    // Compare booking date with today's date in Oman
    const todayInOman = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Muscat",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date());

    const bookingDate = booking.bookingDate
      .toISOString()
      .slice(0, 10);

    if (bookingDate >= todayInOman) {
      return res.status(400).json({
        message: "Feedback can only be submitted after the booking date"
      });
    }

    const existingFeedback = await Feedback.findOne({
      booking: booking._id
    });

    if (existingFeedback) {
      return res.status(409).json({
        message: "Feedback has already been submitted for this booking"
      });
    }

    const feedback = await Feedback.create({
      booking: booking._id,
      user: req.user.id,
      sablah: booking.sablah,
      rating: numericRating,
      comment: cleanComment
    });

    return res.status(201).json({
      message: "Feedback submitted successfully",
      feedback
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Feedback has already been submitted for this booking"
      });
    }

    console.error("Submit feedback error:", error);

    return res.status(500).json({
      message: "Failed to submit feedback"
    });
  }
};

// Get feedback submitted by the logged-in user
exports.getMyFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({
      user: req.user.id
    })
      .select("booking rating comment createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json(feedback);
  } catch (error) {
    console.error("Get my feedback error:", error);

    return res.status(500).json({
      message: "Failed to get feedback"
    });
  }
};
