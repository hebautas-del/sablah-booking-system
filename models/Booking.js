const mongoose = require("mongoose");

// Create the structure for booking data
const bookingSchema = new mongoose.Schema(
  {
    // Link the booking to the selected Sablah
    sablah: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sablah",
      required: true
    },

    // Save the owner who will receive the booking
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Save the user who made the booking
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Save the booking date
    bookingDate: {
      type: Date,
      required: true
    },

    // Number of guests for the booking
    guests: {
      type: Number,
      required: true,
      min: 1
    },

    // Total price of the booking
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },

    // Booking status and  values
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending"
    },

    // Any extra notes added by the user
    notes: {
      type: String,
      default: "",
      trim: true
    }
  },
  {
    // Save the creation and update dates automatically
    timestamps: true
  }
);

// Prevent two active bookings for the same Sablah on the same date
bookingSchema.index(
  { sablah: 1, bookingDate: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["pending", "approved"] }
    }
  }
);

// Export the Booking model to use it in other files
module.exports = mongoose.model("Booking", bookingSchema);