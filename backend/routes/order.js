// backend/routes/order.js
import express from "express";
import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import Order from "../models/order_model.js";
import { protect } from "../middleware/auth.js";
import { sendEmail } from "../utils/mail.js";

const router = express.Router();

// ─── Create Order ───────────────────────────────────────────────────────
router.post("/", protect, async (req, res) => {
  const { products, totalPrice } = req.body;
  try {
    const order = await Order.create({ user: req.user.id, products, totalPrice });
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ─── Get User’s Orders ─────────────────────────────────────────────────
router.get("/", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate("products.product");
    res.json({ success: true, data: orders });
  } catch (err) {
    console.error("Fetch Orders Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ─── Mark Order Paid & Email Invoice ──────────────────────────────────
router.put("/:id/pay", protect, async (req, res) => {
  const { id } = req.params;

  // 1) Validate ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid order ID" });
  }

  try {
    // 2) Load the order
    const order = await Order.findById(id).populate("products.product");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // 3) Authorize
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Forbidden: not your order" });
    }

    // 4) Mark paid
    order.isPaid = true;
    order.paidAt = Date.now();
    await order.save();

    // 5) Generate PDF invoice into a Buffer
    const doc = new PDFDocument({ margin: 50 });
    let buffers = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(buffers);

      // 6) Send the invoice via email
      try {
        await sendEmail({
          to: req.user.email,
          subject: `Your Invoice #${order._id}`,
          html: `
            <h2>Thank you for your purchase!</h2>
            <p>Please find your invoice attached.</p>
            <p><strong>Order #${order._id}</strong></p>
            <p>Total: $${order.totalPrice.toFixed(2)}</p>
          `,
          attachments: [
            {
              filename: `invoice_${order._id}.pdf`,
              content: pdfBuffer.toString("base64"),
              encoding: "base64",
              contentType: "application/pdf"
            }
          ]
        });
      } catch (emailErr) {
        console.error("Error sending invoice email:", emailErr);
        // note: we do not fail the request if email fails
      }
    });

    // 7) Compose the PDF content
    doc.fontSize(20).text("INVOICE", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice #: ${order._id}`);
    doc.text(`Date: ${new Date(order.paidAt).toLocaleString()}`);
    doc.text(`Customer: ${req.user.email}`);
    doc.moveDown();

    // Table header
    doc.font("Helvetica-Bold");
    doc.text("Item", 50, doc.y, { continued: true });
    doc.text("Qty", 300, doc.y, { continued: true });
    doc.text("Price", 350, doc.y, { continued: true });
    doc.text("Total", 450, doc.y);
    doc.moveDown().font("Helvetica");

    // Line items
    order.products.forEach((item) => {
      const { name } = item.product;
      const { qty, price } = item;
      doc.text(name, 50, doc.y, { width: 240, continued: true });
      doc.text(qty.toString(), 300, doc.y, { continued: true });
      doc.text(`$${price.toFixed(2)}`, 350, doc.y, { continued: true });
      doc.text(`$${(price * qty).toFixed(2)}`, 450, doc.y);
    });

    doc.moveDown();
    doc.font("Helvetica-Bold").text(`Grand Total: $${order.totalPrice.toFixed(2)}`, { align: "right" });

    // Finalize
    doc.end();

    // 8) Respond with the updated order
    res.json({ success: true, data: order });
  } catch (err) {
    console.error("Mark Paid Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ─── Cancel (Delete) an Order ───────────────────────────────────────────
router.delete("/:id", protect, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid order ID" });
  }

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Forbidden: not your order" });
    }

    await order.deleteOne();
    res.json({ success: true, message: "Order cancelled successfully" });
  } catch (err) {
    console.error("Cancel Order Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
