import dotenv from "dotenv";
dotenv.config();


import express from 'express';
import { connectDB } from './config/db.js';
import productRoute from './routes/product_route.js'; // Assuming you have a product_route.js file in the routes directory
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/order.js";
import paymentRoutes from "./routes/payment.js";
import invoiceRoutes from "./routes/invoice.js";
import path from "path";


const app = express();

const PORT = process.env.PORT || 5000; // Use the port from environment variables or default to 5000

const __dirname = path.resolve(); // Get the current directory name
app.use(express.static(path.join(__dirname, "/frontend/build"))); // Serve static files from the frontend build directory

app.use(express.json());

app.use("/api/products", productRoute); // Use the product route for all product-related API calls
app.use("/api/users", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/invoice", invoiceRoutes);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

const start = async () => {
  await connectDB();
  app.listen(PORT, () => console.log("Server started at http://localhost:" + PORT))};
start();