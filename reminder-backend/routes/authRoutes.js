const express = require("express");
const router = express.Router();

const { login, register, getMe } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { protect } = require("../middleware/authMiddleware");
// LOGIN
router.post("/login", login);

// REGISTER (opsional)
router.post("/register", register);

// GET CURRENT USER
router.get("/me", protect, getMe);

module.exports = router;
