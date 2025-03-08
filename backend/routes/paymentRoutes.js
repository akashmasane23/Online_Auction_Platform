const express = require("express");
const router = express.Router();

// ✅ Test Payment Endpoint
router.post("/test-payment", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Simulate payment processing delay
    setTimeout(() => {
      console.log("✅ Test Payment Successful for ₹", amount);
      res.status(200).json({ message: "Payment successful (Test Mode)", transactionId: "TEST_TXN_123456" });
    }, 2000); // Simulated delay of 2 seconds
  } catch (error) {
    console.error("❌ Test Payment Error:", error);
    res.status(500).json({ error: "Something went wrong during test payment" });
  }
});

module.exports = router;
