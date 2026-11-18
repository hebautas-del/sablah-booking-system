
const express = require("express");
const router = express.Router();

const {
  addSablah,
  getMySablahs,
  updateSablah,
  deleteSablah
} = require("../controllers/ownerController");

const {
  verifyToken,
  allowRoles
} = require("../middleware/authMiddleware");

const upload = require("../middleware/upload");

router.use(verifyToken, allowRoles(["owner"]));

router.get("/my-sablahs", getMySablahs);

router.post("/sablahs", upload.array("images", 10), addSablah);

router.put("/sablahs/:id", upload.array("images", 10), updateSablah);

router.delete("/sablahs/:id", deleteSablah);

module.exports = router;
