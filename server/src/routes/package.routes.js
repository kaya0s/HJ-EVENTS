import express from 'express';
import { protect, isAdmin } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';
import {
  createPackage,
  listPackages,
  getPackage,
  updatePackage,
  deletePackage,
  toggleAvailability,
} from '../controllers/package.controller.js';

const router = express.Router();

// Public routes
router.get('/', listPackages);
router.get('/:id', getPackage);

// Admin routes
router.post('/', protect, isAdmin, upload.single('image'), createPackage);
router.put('/:id', protect, isAdmin, upload.single('image'), updatePackage);
router.delete('/:id', protect, isAdmin, deletePackage);
router.patch('/:id/availability', protect, isAdmin, toggleAvailability);

export default router;

