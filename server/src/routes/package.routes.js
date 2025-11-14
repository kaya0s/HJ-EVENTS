import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
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
router.post('/', protect, authorize('admin'), upload.single('image'), createPackage);
router.put('/:id', protect, authorize('admin'), upload.single('image'), updatePackage);
router.delete('/:id', protect, authorize('admin'), deletePackage);
router.patch('/:id/availability', protect, authorize('admin'), toggleAvailability);

export default router;
