exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      dob,
      gender,
      wilayat
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      dob,
      gender,
      wilayat
    });

    res.status(201).json({
      message: "Registered successfully",
      user
    });

  } catch (err) {
    console.log(err); // 🔥 THIS WILL SHOW REAL ERROR
    res.status(500).json({ message: err.message });
  }
};