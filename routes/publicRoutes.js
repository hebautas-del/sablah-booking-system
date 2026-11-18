const express = require("express");
const router = express.Router();

const {
  getPublicSablahs
} = require("../controllers/publicController");

// Public route: anyone can browse sablah listings
router.get("/sablahs", getPublicSablahs);

module.exports = router;