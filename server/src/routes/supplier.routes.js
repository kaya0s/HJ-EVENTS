import express from 'express';
import { protect, isAdmin } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';
import {
  createSupplier,
  listSuppliers,
  getSupplier,
  updateSupplier,
  deleteSupplier,
} from '../controllers/supplier.controller.js';

const router = express.Router();

router.get('/', listSuppliers);
router.get('/:id', getSupplier);

// Admin CRUD
router.post('/', protect, isAdmin, upload.single('image'), createSupplier);
router.put('/:id', protect, isAdmin, upload.single('image'), updateSupplier);
router.delete('/:id', protect, isAdmin, deleteSupplier);

export default router;
