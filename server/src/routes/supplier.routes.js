import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';
import {
  createSupplier,
  listSuppliers,
  getSupplier,
  updateSupplier,
  deleteSupplier,
  getMyProfile,
  updateMyProfile,
  getMyBookings,
  updateBookingStatus,
} from '../controllers/supplier.controller.js';

const router = express.Router();

// Public routes
router.get('/', listSuppliers);

// Supplier access
router.get('/my-profile', protect, authorize('supplier'), getMyProfile);
router.put('/my-profile', protect, authorize('supplier'), updateMyProfile);
router.get('/my-bookings', protect, authorize('supplier'), getMyBookings);
router.patch('/booking/:bookingId/status', protect, authorize('supplier'), updateBookingStatus);

// Admin access
router.post('/', protect, authorize('admin'), upload.single('image'), createSupplier);
router.put('/:id', protect, authorize('admin'), upload.single('image'), updateSupplier);
router.delete('/:id', protect, authorize('admin'), deleteSupplier);

// Public route for single supplier (keep last to avoid conflicts)
router.get('/:id', getSupplier);
export default router;
