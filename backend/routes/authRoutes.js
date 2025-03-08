const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

// 🔹 Signup Route (POST Request)
router.post("/signup", async (req, res) => {
  try {
    console.log("🔹 Signup route hit!");
    console.log("🔹 Request body:", req.body);

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      console.log("❌ Missing fields");
      return res.status(400).json({ error: "All fields are required!" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, email, password: hashedPassword });
    await user.save(); // 🔹 Save user first

    // 🔹 Generate JWT token after user is saved
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log("✅ User created & token generated:", token);

    res.status(201).json({
      message: "User Created Successfully",
      token: token,
    });
  } catch (error) {
    console.error("❌ Error signing up:", error.message);
    res.status(500).json({ error: "Error signing up!" });
  }
});

// 🔹 Signin Route (POST Request)
router.post("/signin", async (req, res) => {
  try {
    console.log("🔹 Signin route hit!");
    console.log("🔹 Request body:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found");
      return res.status(400).json({ error: "Invalid credentials!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Incorrect password");
      return res.status(400).json({ error: "Invalid credentials!" });
    }

    // 🔹 Generate JWT token with expiry
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log("✅ Signin successful & token generated:", token);

    res.status(200).json({
      message: "Login Successfully",
      token: token,
    });
  } catch (error) {
    console.error("❌ Signin error:", error.message);
    res.status(500).json({ error: "Error signing in!" });
  }
});

module.exports = router;
