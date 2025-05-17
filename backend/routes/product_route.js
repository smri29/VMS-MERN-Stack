import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '../controllers/product.controller.js';

const router = express.Router();

// ✅ Public: anyone can view products
router.get('/', getProducts);

// 🔒 Protected: only logged-in users can modify products
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);

export default router;
