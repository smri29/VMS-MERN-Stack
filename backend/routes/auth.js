// backend/routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user_model.js";
import { protect } from "../middleware/auth.js";
const router = express.Router();

// Helper to sign JWT
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// --- SIGNUP (with optional referral) ---
router.post("/signup", async (req, res) => {
  const { name, email, password, ref } = req.body;
  try {
    if (await User.findOne({ email })) {
      return res
        .status(400)
        .json({ success: false, message: "Email already in use" });
    }
    const data = { name, email, password };
    if (ref) data.referredBy = ref;

    const user = await User.create(data);

    // Populate the virtual referralCount
    await user.populate("referralCount");

    const token = signToken(user._id);
    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        token,
        referralCode: user.referralCode,
        referralCount: user.referralCount,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- LOGIN ---
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Populate the virtual referralCount
    await user.populate("referralCount");

    const token = signToken(user._id);
    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        token,
        referralCode: user.referralCode,
        referralCount: user.referralCount,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- UPDATE PROFILE (name/email) ---
router.put("/profile", protect, async (req, res) => {
  const { name, email } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    user.name = name || user.name;
    user.email = email || user.email;
    await user.save();

    res.json({
      success: true,
      data: { name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- CHANGE PASSWORD ---
router.put("/password", protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id).select("+password");
    if (!user || !(await user.matchPassword(currentPassword))) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect current password" });
    }
    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- DELETE ACCOUNT ---
router.delete("/", protect, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ success: true, message: "Account deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
