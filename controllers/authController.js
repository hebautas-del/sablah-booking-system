const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// These are the roles allowed to register by themselves
const SELF_SERVICE_ROLES = ["user", "owner"];

// Store OTP codes temporarily
const otpStore = new Map();

// OTP is valid for 10 minutes
const OTP_LIFETIME_MS = 10 * 60 * 1000;

// Maximum number of wrong OTP attempts
const MAX_ATTEMPTS = 5;


// =====================================
// VALIDATION HELPERS
// =====================================

// Remove extra spaces and convert email to lowercase
const normalizeEmail = (email) =>
  String(email || "").trim().toLowerCase();

// Check if the email format is valid
const isValidEmail = (email) => {
  return (
    typeof email === "string" &&
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
  );
};

// Check if the name contains Arabic or English letters
// Numbers and special symbols are not allowed
const isValidName = (name) => {
  return (
    typeof name === "string" &&
    /^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u.test(
      name.trim()
    )
  );
};

// Check if the phone number has exactly 8 digits
const isValidPhone = (phone) => {
  return typeof phone === "string" && /^[0-9]{8}$/.test(phone.trim());
};

// Check if the password meets the security rules
const isValidPassword = (password) => {
  return (
    typeof password === "string" &&
    password.length > 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9\s]/.test(password) &&
    !/\s/.test(password)
  );
};


// =====================================
// REGISTER — USER AND OWNER
// =====================================

exports.register = async (req, res) => {
  try {
    // Get the registration data from the request
    const {
      name,
      password,
      phone,
      dob,
      gender,
      wilayat,
      locationLat,
      locationLng
    } = req.body;

    // Clean the email and get the selected role
    const email = normalizeEmail(req.body.email);

    const role = String(req.body.role || "user")
      .trim()
      .toLowerCase();

    // Check that the required fields are entered
    if (
      typeof name !== "string" ||
      typeof req.body.email !== "string" ||
      typeof password !== "string" ||
      typeof phone !== "string" ||
      !name.trim() ||
      !email ||
      !password ||
      !phone.trim()
    ) {
      return res.status(400).json({
        message: "Name, email, phone and password are required"
      });
    }

    // Only User and Owner can register themselves
    if (!SELF_SERVICE_ROLES.includes(role)) {
      return res.status(403).json({
        message: "Invalid registration role"
      });
    }

    // Check the name format
    if (!isValidName(name)) {
      return res.status(400).json({
        message: "Name must contain Arabic or English letters only"
      });
    }

    // Check the email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address"
      });
    }

    // Check the phone number format
    if (!isValidPhone(phone)) {
      return res.status(400).json({
        message: "Phone number must contain exactly 8 digits"
      });
    }

    // Check the password requirements
    if (!isValidPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 9 characters and contain uppercase, lowercase, number and special character"
      });
    }

    // Check if this email is already used
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered"
      });
    }

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare the data for the new account
    const userData = {
      name: name.trim(),
      email,
      phone: phone.trim(),
      password: hashedPassword,
      role
    };

    // Add extra information if the account is a regular user
    if (role === "user") {
      userData.dob = dob || "";
      userData.gender = gender || "";
      userData.wilayat = wilayat || "";
    }

    // Save the optional map point for both account types.
    // Ignore incomplete or out-of-range coordinate pairs.
    const parsedLat = locationLat === null || locationLat === "" || locationLat === undefined
      ? null
      : Number(locationLat);
    const parsedLng = locationLng === null || locationLng === "" || locationLng === undefined
      ? null
      : Number(locationLng);

    if (parsedLat !== null && parsedLng !== null &&
        Number.isFinite(parsedLat) && Number.isFinite(parsedLng) &&
        parsedLat >= -90 && parsedLat <= 90 &&
        parsedLng >= -180 && parsedLng <= 180) {
      userData.locationLat = parsedLat;
      userData.locationLng = parsedLng;
    }

    // Keep the selected wilayat for both guest and owner accounts.
    userData.wilayat = typeof wilayat === "string" ? wilayat.trim() : "";

    // Save the new account in MongoDB
    const user = await User.create(userData);

    // Send the registration success response
    return res.status(201).json({
      message: "Registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (err) {
    console.error("Registration error:", err);

    // Handle duplicate email errors
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Email is already registered"
      });
    }

    return res.status(500).json({
      message: "Registration failed"
    });
  }
};


// =====================================
// LOGIN
// =====================================

exports.login = async (req, res) => {
  try {
    console.log("[LOGIN] Request received");

    // Get and clean the login details
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    // Check that the email and password are valid
    if (
      !email ||
      !isValidEmail(email) ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        message: "Please enter a valid email and password"
      });
    }

    console.log("[LOGIN] Checking user");

    // Find the account and include its hidden password field
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Compare the entered password with the hashed password
    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Check that the JWT secret is available
    if (!process.env.JWT_SECRET) {
      console.error("[LOGIN] JWT_SECRET is missing");

      return res.status(500).json({
        message: "Server configuration error"
      });
    }

    // Create a token with the user's ID and role
    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("[LOGIN] Login successful");

    // Send the token and account information
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (err) {
    console.error("[LOGIN ERROR]", err.message);
    console.error(err.stack);

    return res.status(500).json({
      message: "Server error during login"
    });
  }
};


// =====================================
// FORGOT PASSWORD
// =====================================

exports.forgotPassword = async (req, res) => {
  try {
    // Get the email entered by the user
    const email = normalizeEmail(req.body.email);

    // Use the same message whether the email exists or not
    const genericReply = {
      message:
        "If this email is registered, an OTP has been sent"
    };

    // Check the email format
    if (!isValidEmail(email)) {
      return res.json(genericReply);
    }

    // Find the account using the email
    const user = await User.findOne({ email });

    if (!user) {
      return res.json(genericReply);
    }

    // Generate a random six-digit OTP
    const otp = String(
      crypto.randomInt(100000, 1000000)
    );

    // Save the OTP with its expiry time and attempt count
    otpStore.set(email, {
      otp,
      expires: Date.now() + OTP_LIFETIME_MS,
      attempts: 0
    });

    // Send the OTP to the user's email
    await sendEmail(
      email,
      "Sablah password reset code",
      `Your verification code is ${otp}. It expires in 10 minutes.`
    );

    // Show the OTP in the console only during development
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV] OTP generated for ${email}`);
    }

    return res.json(genericReply);

  } catch (err) {
    console.error("Forgot password error:", err);

    return res.status(500).json({
      message: "Could not process password reset request"
    });
  }
};


// =====================================
// RESET PASSWORD
// =====================================

exports.resetPassword = async (req, res) => {
  try {
    // Get the email, OTP and new password
    const email = normalizeEmail(req.body.email);
    const { otp, newPassword } = req.body;

    // Check that all required information is entered
    if (
      !isValidEmail(email) ||
      !otp ||
      typeof newPassword !== "string" ||
      !newPassword
    ) {
      return res.status(400).json({
        message: "Valid email, OTP and new password are required"
      });
    }

    // Check the new password using the same rules as registration
    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 9 characters and contain uppercase, lowercase, number and special character"
      });
    }

    // Get the saved OTP information
    const entry = otpStore.get(email);

    // Check if the OTP exists and is still valid
    if (!entry || Date.now() > entry.expires) {
      otpStore.delete(email);

      return res.status(400).json({
        message: "Invalid or expired OTP"
      });
    }

    // Check if the user has reached the maximum attempts
    if (entry.attempts >= MAX_ATTEMPTS) {
      otpStore.delete(email);

      return res.status(429).json({
        message: "Too many attempts. Request a new OTP"
      });
    }

    // Compare the entered OTP with the saved OTP
    if (String(otp).trim() !== entry.otp) {
      entry.attempts += 1;

      return res.status(400).json({
        message: "Invalid or expired OTP"
      });
    }

    // Hash the new password before saving it
    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    // Update the password in MongoDB
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: { password: hashedPassword } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      otpStore.delete(email);

      return res.status(400).json({
        message: "Unable to update password"
      });
    }

    // Remove the OTP after the password is changed
    otpStore.delete(email);

    return res.json({
      message: "Password updated successfully"
    });

  } catch (err) {
    console.error("Reset password error:", err);

    return res.status(500).json({
      message: "Could not reset password"
    });
  }
};