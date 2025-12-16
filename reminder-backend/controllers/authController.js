// controllers/authController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Helper membuat JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ✅ REGISTER USER (sementara, kalau butuh)
exports.register = async (req, res) => {
  try {
    const { nama, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email sudah digunakan"
      });
    }

    const user = new User({ nama, email, password, role });
    await user.save();

    res.json({
      success: true,
      message: "User berhasil dibuat",
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal membuat user",
      error: error.message
    });
  }
};

// ✅ LOGIN USER
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cari user berdasarkan email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email tidak ditemukan"
      });
    }

    // Cek password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Password salah"
      });
    }

    // Buat token
    const token = generateToken(user);
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: "Login berhasil",
      data: {
        user,
        token
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login error",
      error: error.message
    });
  }
};

// ✅ GET CURRENT USER (untuk /auth/me)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data user",
      error: error.message
    });
  }
};
