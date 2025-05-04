// backend/routes/invoice.js
import express from "express";
import PDFDocument from "pdfkit";
import mongoose from "mongoose";
import { protect } from "../middleware/auth.js";
import Order from "../models/order_model.js";

const router = express.Router();

router.get("/:id", protect, async (req, res) => {
  const { id } = req.params;

  // 1) Validate the ID 
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid order ID" });
  }

  // 2) Load the order
  const order = await Order.findById(id).populate("products.product");
  if (!order) {
    return res
      .status(404)
      .json({ success: false, message: "Order not found" });
  }

  // 3) Authorize
  if (order.user.toString() !== req.user.id) {
    return res
      .status(403)
      .json({ success: false, message: "Forbidden: not your order" });
  }

  // 4) Stream the PDF
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice_${order._id}.pdf`
  );

  const doc = new PDFDocument();
  doc.pipe(res);

  doc.fontSize(20).text("Invoice", { align: "center" }).moveDown();
  order.products.forEach((item) => {
    doc.text(
      `${item.product.name} x${item.qty} — $${(item.price * item.qty).toFixed(
        2
      )}`
    );
  });
  doc.moveDown().fontSize(16).text(`Total: $${order.totalPrice.toFixed(2)}`);

  doc.end();
});

export default router;
