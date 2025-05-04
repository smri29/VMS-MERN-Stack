import express from 'express';
import { createProduct, deleteProduct, getProducts, updateProduct } from '../controllers/product.controller.js';

const router = express.Router();

router.get("/", getProducts); // Assuming you have a getProducts function in your controllers directory
router.post("/", createProduct); // Assuming you have a createProduct function in your controllers directory
router.put("/:id", updateProduct); // Assuming you have a Product model imported from your models directory
router.delete("/:id", deleteProduct); // Assuming you have a Product model imported from your models directory

export default router;