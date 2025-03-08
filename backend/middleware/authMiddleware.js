const jwt = require("jsonwebtoken");
const User = require("../models/users");

const authMiddleware = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV !== "production") {
      console.log("🔹 Received Headers:", req.headers);
    }

    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Missing or malformed token." });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Token not found in header." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ error: "Unauthorized: Token has expired." });
      }
      return res.status(401).json({ error: "Unauthorized: Invalid token." });
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("✅ Decoded Token:", decoded);
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found." });
    }

    req.user = user;

    if (process.env.NODE_ENV !== "production") {
      console.log("✅ Authenticated User:", user.username);
    }

    next();
  } catch (error) {
    console.error("❌ Authentication Error:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = authMiddleware;
