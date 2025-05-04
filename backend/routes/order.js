// backend/routes/order.js
import express from "express";
import mongoose from "mongoose";
import Order from "../models/order_model.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Create Order
router.post("/", protect, async (req, res) => {
  const { products, totalPrice } = req.body;
  try {
    const order = await Order.create({ user: req.user.id, products, totalPrice });
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get User’s Orders
router.get("/", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate("products.product");
    res.json({ success: true, data: orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ←–– New: Cancel (delete) an Order
router.delete("/:id", protect, async (req, res) => {
  const { id } = req.params;

  // 1) Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid order ID" });
  }

  try {
    // 2) Load the order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // 3) Ensure the logged-in user owns it
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Forbidden: not your order" });
    }

    // 4) Delete
    await order.deleteOne();
    res.json({ success: true, message: "Order cancelled successfully" });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
