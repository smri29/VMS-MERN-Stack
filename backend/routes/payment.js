// backend/routes/payment.js
import dotenv from "dotenv";
dotenv.config(); 

import express from "express";
import Stripe from "stripe";
import { protect } from "../middleware/auth.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// Create Payment Intent
router.post("/create-payment-intent", protect, async (req, res) => {
  const { amount, currency = "usd" } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({ amount, currency });
    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
