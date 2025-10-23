import express from 'express';
import { protect, isAdmin, isSupplier } from '../middlewares/auth.js';
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
router.get('/:id', getSupplier);

// Admin access
router.post('/', protect, isAdmin, upload.single('image'), createSupplier);
router.put('/:id', protect, isAdmin, upload.single('image'), updateSupplier);
router.delete('/:id', protect, isAdmin, deleteSupplier);

// Supplier access
router.get('/my-profile', protect, isSupplier, getMyProfile);
router.put('/my-profile', protect, isSupplier, updateMyProfile);
router.get('/my-bookings', protect, isSupplier, getMyBookings);
router.patch('/booking/:bookingId/status', protect, isSupplier, updateBookingStatus);
export default router;
