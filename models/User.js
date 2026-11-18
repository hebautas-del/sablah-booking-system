
const mongoose = require("mongoose");

// Validate Arabic and English names.
// Numbers and special characters are not allowed.
const nameRegex =
  /^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u;

// Validate email format.
const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Validate Omani phone numbers: exactly 8 digits.
// Empty value is allowed at schema level for existing accounts
// that may not have a phone number.
const phoneRegex = /^([0-9]{8})?$/;

const userSchema = new mongoose.Schema(
  {
    // BASIC ACCOUNT FIELDS

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      validate: {
        validator: function (value) {
          return nameRegex.test(value);
        },
        message: "Name must contain Arabic or English letters only"
      }
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: [
        emailRegex,
        "Please enter a valid email address"
      ]
    },

    phone: {
      type: String,
      trim: true,
      default: "",
      match: [
        phoneRegex,
        "Phone number must contain exactly 8 digits"
      ]
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false
    },

    // ACCOUNT ROLE
    role: {
      type: String,
      enum: ["user", "owner", "admin"],
      default: "user",
      required: true
    },

    // USER FIELDS
    dob: {
      type: String,
      default: ""
    },

    gender: {
      type: String,
      default: ""
    },

    wilayat: {
      type: String,
      default: ""
    },

    // Optional map coordinates selected during registration
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

    // OWNER FIELDS
    businessName: {
      type: String,
      default: ""
    },

    sablahNameEn: {
      type: String,
      default: ""
    },

    sablahNameAr: {
      type: String,
      default: ""
    },

    area: {
      type: String,
      default: ""
    },

    capacity: {
      type: String,
      default: ""
    },

    price: {
      type: String,
      default: ""
    },

    address: {
      type: String,
      default: ""
    },

    descriptionEn: {
      type: String,
      default: ""
    },

    descriptionAr: {
      type: String,
      default: ""
    },

    amenities: {
      type: String,
      default: ""
    },

    // OTP FIELDS
    otp: {
      type: String,
      default: undefined,
      select: false
    },

    otpExpires: {
      type: Date,
      default: undefined,
      select: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
