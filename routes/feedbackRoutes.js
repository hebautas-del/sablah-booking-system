
const express = require("express");
const router = express.Router();

const {
  submitFeedback,
  getMyFeedback
} = require("../controllers/feedbackController");

const {
  verifyToken,
  allowRoles
} = require("../middleware/authMiddleware");

router.post(
  "/",
  verifyToken,
  allowRoles(["user"]),
  submitFeedback
);

router.get(
  "/my-feedback",
  verifyToken,
  allowRoles(["user"]),
  getMyFeedback
);

module.exports = router;
