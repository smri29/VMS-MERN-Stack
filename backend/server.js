// backend/server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { connectDB } from "./config/db.js";
import productRoute from "./routes/product_route.js";
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/order.js";
import paymentRoutes from "./routes/payment.js";
import invoiceRoutes from "./routes/invoice.js";

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Serve static frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend", "dist")));
}

app.use(express.json());

// API routes
app.use("/api/products", productRoute);
app.use("/api/users", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/invoice", invoiceRoutes);

// Always serve index.html for client‑side routing
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
  });
}

const start = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`));
};

start();
