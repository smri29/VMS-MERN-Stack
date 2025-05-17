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

  // 4) Set headers and start PDF
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice_${order._id}.pdf`
  );

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(res);

  // ---------- Styles & Branding ----------
  const primaryColor = "#2D3748"; // dark gray
  const accentColor  = "#4FD1C5"; // teal
  doc.registerFont("Heading", "Helvetica-Bold");
  doc.registerFont("Regular", "Helvetica");

  // ---------- Header ----------
  // If you have a logo, you can do:
  // doc.image("path/to/logo.png", 50, 45, { width: 100 });
  doc
    .fillColor(primaryColor)
    .font("Heading")
    .fontSize(24)
    .text("Vehicle Management System", { align: "left" });

  doc
    .moveDown(0.5)
    .fontSize(10)
    .font("Regular")
    .fillColor("gray")
    .text("Fx3Losers Group", { continued: true })
    .text(" | International University of Business Agriculture and Technology", { align: "left" })
    .moveDown();

  // Draw a thin line below header
  doc
    .strokeColor(accentColor)
    .lineWidth(1)
    .moveTo(50, 120)
    .lineTo(545, 120)
    .stroke();

  // ---------- Invoice Details ----------
  const top = 130;
  doc
    .fontSize(12)
    .fillColor(primaryColor)
    .text(`Invoice #: ${order._id}`, 50, top)
    .text(`Date: ${order.createdAt.toLocaleDateString()}`, 50, top + 15)
    .text(`Customer: ${req.user.name}`, 50, top + 30)
    .text(`Email: ${req.user.email}`, 50, top + 45);

  // ---------- Table Header ----------
  const tableTop = top + 80;
  doc
    .font("Heading")
    .fontSize(12)
    .fillColor(primaryColor)
    .text("Item", 50, tableTop)
    .text("Qty", 300, tableTop, { width: 50, align: "right" })
    .text("Unit Price", 360, tableTop, { width: 80, align: "right" })
    .text("Line Total", 450, tableTop, { width: 80, align: "right" });

  // Draw header underline
  doc
    .strokeColor("lightgray")
    .lineWidth(0.5)
    .moveTo(50, tableTop + 15)
    .lineTo(545, tableTop + 15)
    .stroke();

  // ---------- Table Rows ----------
  let y = tableTop + 25;
  doc.font("Regular").fontSize(11).fillColor("black");

  order.products.forEach((item) => {
    const lineTotal = (item.price * item.qty).toFixed(2);

    doc
      .text(item.product.name, 50, y)
      .text(item.qty, 300, y, { width: 50, align: "right" })
      .text(`$${item.price.toFixed(2)}`, 360, y, { width: 80, align: "right" })
      .text(`$${lineTotal}`, 450, y, { width: 80, align: "right" });

    y += 20;

    // Draw a light row separator
    doc
      .strokeColor("whitesmoke")
      .lineWidth(0.5)
      .moveTo(50, y - 5)
      .lineTo(545, y - 5)
      .stroke();
  });

  // ---------- Total ----------
  const totalY = y + 20;
  doc
    .font("Heading")
    .fontSize(12)
    .fillColor(primaryColor)
    .text("Total", 360, totalY, { width: 80, align: "right" })
    .text(`$${order.totalPrice.toFixed(2)}`, 450, totalY, { width: 80, align: "right" });

  // ---------- Footer ----------
  doc
    .fontSize(10)
    .fillColor("gray")
    .font("Regular")
    .text(
      "Thank you for your purchase! If you have any questions, contact us at support@vms.com",
      50,
      780,
      { align: "center", width: 495 }
    );

  doc.end();
});

export default router;
