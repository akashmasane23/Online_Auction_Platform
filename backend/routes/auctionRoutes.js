const express = require("express");
const multer = require("multer");
const Auction = require("../models/auctions");
const User = require("../models/users");
const authMiddleware = require("../middleware/authMiddleware");
const path = require("path");
const fs = require("fs");

const router = express.Router();

/** 🔹 Multer Storage Setup */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

/** ✅ Create a New Auction */
router.post("/auctions", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized: You must be logged in" });
    }

    const { title, description, startingBid, endTime } = req.body;
    if (!title || !description || !startingBid || !endTime) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const parsedStartingBid = Number(startingBid);
    if (isNaN(parsedStartingBid) || parsedStartingBid <= 0) {
      return res.status(400).json({ error: "Starting bid must be a positive number." });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : "";

    const auction = new Auction({
      title,
      description,
      startingBid: parsedStartingBid,
      currentBid: parsedStartingBid,
      endTime,
      isClosed: false,
      highestBidder: null,
      image,
      owner: req.user._id,
    });

    await auction.save();

    // ✅ Fetch auction with owner's username
    const populatedAuction = await Auction.findById(auction._id).populate("owner", "username");

    res.status(201).json({
      message: "Auction created successfully!",
      data: {
        ...populatedAuction.toObject(),
        owner: populatedAuction.owner.username,
      },
    });
  } catch (error) {
    console.error("❌ Error creating auction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** ✅ Fetch All Auctions */
router.get("/auctions", async (req, res) => {
  try {
    const currentTime = new Date();

    const auctions = await Auction.find()
      .populate("highestBidder", "username")
      .populate("owner", "username");

    const updatedAuctions = auctions.map((auction) => ({
      ...auction.toObject(),
      highestBidder: auction.highestBidder ? auction.highestBidder.username : null,
      owner: auction.owner ? auction.owner.username : null,
      isClosed: auction.isClosed || new Date(auction.endTime) < currentTime, // ✅ Auto-close if expired
    }));

    res.status(200).json({ message: "Auctions fetched successfully", data: updatedAuctions });
  } catch (error) {
    console.error("❌ Error fetching auctions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** ✅ Fetch a Single Auction */
router.get("/auctions/:id", async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate("highestBidder", "username")
      .populate("owner", "username email");

    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    res.status(200).json({
      message: "Auction fetched successfully",
      data: {
        ...auction.toObject(),
        highestBidder: auction.highestBidder ? auction.highestBidder.username : null,
        owner: auction.owner ? auction.owner.username : null,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching auction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** ✅ Delete an Auction (Only Owner) */
router.delete("/auctions/:id", authMiddleware, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    if (auction.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to delete this auction" });
    }

    if (auction.image) {
      const imagePath = path.join(__dirname, "..", auction.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Auction.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Auction deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting auction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** ✅ Place a Bid */
router.post("/auctions/:id/bid", authMiddleware, async (req, res) => {
  try {
    const { bidAmount } = req.body;
    if (!bidAmount) {
      return res.status(400).json({ error: "Bid amount is required!" });
    }

    const parsedBidAmount = Number(bidAmount);
    if (isNaN(parsedBidAmount) || parsedBidAmount <= 0) {
      return res.status(400).json({ error: "Bid amount must be a positive number!" });
    }

    let auction = await Auction.findById(req.params.id).populate("highestBidder", "username");

    if (!auction) {
      return res.status(404).json({ error: "Auction item not found" });
    }

    // if (auction.isClosed || new Date() >= new Date(auction.endTime)) {
    //   return res.status(400).json({ error: "Auction has ended. No more bids allowed." });
    // }

    if (parsedBidAmount <= auction.currentBid) {
      return res.status(400).json({ error: "Bid must be higher than the current bid" });
    }

    auction.currentBid = parsedBidAmount;
    auction.highestBidder = req.user._id;
    await auction.save();

    // ✅ Fetch updated auction with bidder's username
    auction = await Auction.findById(req.params.id).populate("highestBidder", "username");

    res.status(200).json({
      message: "Bid placed successfully",
      data: {
        ...auction.toObject(),
        highestBidder: auction.highestBidder ? auction.highestBidder.username : null,
      },
    });
  } catch (error) {
    console.error("❌ Error placing bid:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
