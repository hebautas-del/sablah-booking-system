
const Sablah = require("../models/Sablah");

// GET ALL PUBLIC SABLAHS
// Retrieve all sablah listings for users to browse.
exports.getPublicSablahs = async (req, res) => {
  try {
    const sablahs = await Sablah.find()
      .populate("owner", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json(sablahs);
  } catch (err) {
    console.error("Get Public Sablahs Error:", err);

    return res.status(500).json({
      message: "Failed to retrieve sablahs"
    });
  }
};
