import express from 'express';
import { protect, isAdmin } from '../middlewares/auth.js';
import {
  createBooking,
  getMyBookings,
  cancelBooking,
  approveBooking,
  rejectBooking,
  mockPayment,
} from '../controllers/booking.controller.js';

const router = express.Router();

router.post('/', protect, isAdmin, createBooking);
router.get('/me', protect, isAdmin, getMyBookings);
router.post('/cancel/:id', protect, cancelBooking);

// Admin actions
router.post('/approve/:id', protect, isAdmin, approveBooking);
router.post('/reject/:id', protect, isAdmin, rejectBooking);

// Mock payment
router.post('/payment', protect, mockPayment);

export default router;
