const express = require("express");
const connectDB = require("./config/dbconfig");
const authRoutes = require("./routes/authRoutes");
const auctionRoutes = require("./routes/auctionRoutes");
const paymentRoutes = require("./routes/paymentRoutes"); // 🔹 Added payment routes
require("dotenv").config();
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

// 🔹 Serve Static Files for Assets
app.use("/assets", express.static(path.join(__dirname, "assets")));

// 🔹 Serve Uploaded Images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", authRoutes);
app.use("/api", auctionRoutes);
app.use("/api/payment", paymentRoutes); // 🔹 Added Payment API Route

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

startServer();
