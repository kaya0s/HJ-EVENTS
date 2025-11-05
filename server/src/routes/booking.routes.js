import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import {
  createBooking,
  getMyBookings,
  cancelBooking,
  approveBooking,
  rejectBooking,
  mockPayment,
} from '../controllers/booking.controller.js';

const router = express.Router();

router.post('/', protect, authorize('admin'), createBooking);
router.get('/me', protect, authorize('admin'), getMyBookings);
router.post('/cancel/:id', protect, cancelBooking);

// Admin actions
router.post('/approve/:id', protect, authorize('admin'), approveBooking);
router.post('/reject/:id', protect, authorize('admin'), rejectBooking);

// Mock payment
router.post('/payment', protect, mockPayment);

export default router;
