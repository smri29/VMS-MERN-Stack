// backend/models/order_model.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products:   [{
    product:   { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    qty:       { type: Number, required: true, default: 1 },
    price:     { type: Number, required: true },
  }],
  totalPrice: { type: Number, required: true },
  isPaid:     { type: Boolean, default: false },
  paidAt:     Date,
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
