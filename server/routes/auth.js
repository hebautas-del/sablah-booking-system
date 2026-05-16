const otpStore = new Map();

// SEND OTP
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000);

  otpStore.set(email, otp);

  res.json({ message: "OTP sent", otp }); // (for demo)
});

// VERIFY OTP + RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (otpStore.get(email) != otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await User.findOneAndUpdate(
    { email },
    { password: hashed }
  );

  otpStore.delete(email);

  res.json({ message: "Password updated" });
});

router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;

    if (req.body.password && req.body.password.trim() !== "") {
      user.password = await bcrypt.hash(req.body.password, 10);
    }

    await user.save();

    res.json({
      message: "Profile updated",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error"
    });
  }
});