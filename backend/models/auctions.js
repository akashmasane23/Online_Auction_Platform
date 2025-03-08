const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    startingBid: { type: Number, required: true },
    currentBid: { type: Number, required: true },
    highestBidder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    endTime: { type: Date, required: true },
    isClosed: { type: Boolean, default: false },
    image: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// ✅ Virtual field for `ownerUsername`
auctionSchema.virtual("ownerUsername", {
  ref: "User",
  localField: "owner",
  foreignField: "_id",
  justOne: true,
  options: { select: "username" },
});

// ✅ Virtual field for `highestBidderUsername`
auctionSchema.virtual("highestBidderUsername", {
  ref: "User",
  localField: "highestBidder",
  foreignField: "_id",
  justOne: true,
  options: { select: "username" },
});

const Auction = mongoose.model("Auction", auctionSchema);
module.exports = Auction;
