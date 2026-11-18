const mongoose = require("mongoose");

// Create the schema for the Sablah
const sablahSchema = new mongoose.Schema(
  {
    // Link each Sablah to its owner
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Sablah name in English
    nameEn: {
      type: String,
      required: true,
      trim: true
    },

    // Sablah name in Arabic
    nameAr: {
      type: String,
      required: true,
      trim: true
    },

    // Set Muscat as the default governorate
    governorate: {
      type: String,
      default: "Muscat",
      trim: true
    },

    // Save the wilayat where the Sablah is located
    wilayat: {
      type: String,
      required: true,
      trim: true
    },

    // Keep this field for older records
    area: {
      type: String,
      required: true,
      trim: true
    },

    // Set the maximum number of people the Sablah can hold
    capacity: {
      type: Number,
      required: true,
      min: 1
    },

    // Save the booking price
    price: {
      type: Number,
      required: true,
      min: 0
    },

    // Save the full address of the Sablah
    address: {
      type: String,
      required: true,
      trim: true
    },

    // Exact map coordinates of the Sablah venue
    locationLat: {
      type: Number,
      default: null,
      min: -90,
      max: 90
    },
    locationLng: {
      type: Number,
      default: null,
      min: -180,
      max: 180
    },

    // Sablah description in English
    descriptionEn: {
      type: String,
      default: ""
    },

    // Sablah description in Arabic
    descriptionAr: {
      type: String,
      default: ""
    },

    // List of facilities available in the Sablah
    amenities: {
      type: [String],
      default: []
    },

    // Save the main Sablah image
    image: {
      type: String,
      default: ""
    },

    // Save other images of the Sablah
    images: {
      type: [String],
      default: []
    }
  },
  {
    // Automatically save when the record was created and updated
    timestamps: true
  }
);

// Export the Sablah model so we can use it in other files
module.exports = mongoose.model("Sablah", sablahSchema);