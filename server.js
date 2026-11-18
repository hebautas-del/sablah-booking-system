
// Import the required packages
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const dns = require("dns");
const path = require("path");

// Load environment variables from the .env file
dotenv.config();

// Configure DNS servers to help resolve MongoDB connection addresses
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Import the API route files
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
const userRoutes = require("./routes/auth");
const bookingRoutes = require("./routes/bookingRoutes");
const publicRoutes = require("./routes/publicRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");

// Create the Express application
const app = express();

// Enable CORS to allow requests from the frontend
app.use(cors());

// Allow the server to receive and parse JSON request bodies
app.use(express.json());

// Make uploaded images accessible through the /uploads URL
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect each API route to its corresponding URL prefix
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/users", userRoutes);
app.use("/api", publicRoutes);

// Define a root route to check whether the API is running
app.get("/", (req, res) => {
  res.send("Sablah API Running");
});

// Connect the application to the MongoDB database
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    // Display a message when the database connection succeeds
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    // Display an error message if the database connection fails
    console.log("Mongo Error:", err);
  });

// Set the server port from the environment variable or use 5000
const PORT = process.env.PORT || 5000;

// Start the Express server and listen for incoming requests
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
