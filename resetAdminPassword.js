const dns = require("dns");

// حل مشكلة DNS قبل الاتصال بـ MongoDB
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("readline");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (question) =>
  new Promise((resolve) => rl.question(question, resolve));

async function resetAdminPassword() {
  try {
    const email = (await ask("Admin email: "))
      .trim()
      .toLowerCase();

    const newPassword = await ask("New password: ");

    if (!email || newPassword.length < 8) {
      throw new Error(
        "Email is required and password must be at least 8 characters."
      );
    }

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from your .env file.");
    }

    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected.");

    const admin = await User.findOne({ email }).select("+password");

    if (!admin) {
      throw new Error("No account found with this email.");
    }

    if (admin.role !== "admin") {
      throw new Error("This account is not an admin account.");
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    console.log("Admin password updated successfully.");

  } catch (error) {
    console.error("Password reset failed:", error.message);
    process.exitCode = 1;

  } finally {
    await mongoose.disconnect().catch(() => {});
    rl.close();
  }
}

resetAdminPassword();