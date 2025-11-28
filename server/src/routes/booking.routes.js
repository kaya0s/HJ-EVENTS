import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import {
  createBooking,
  getMyBookings,
  cancelBooking,
  updateBooking,
  approveBooking,
  rejectBooking,
  getBookedDates,
  getAllBookings,
  assignSuppliersToBooking,
  completeBooking,
  sendBookingVerificationCode,
  verifyBookingCode,
  createPaypalOrder,
  capturePaypalOrder,
} from '../controllers/booking.controller.js';

const router = express.Router();
  
// Public route for availability calendar
router.get('/availability', getBookedDates);

// Booking verification endpoints
router.post('/send-verification', protect, sendBookingVerificationCode);
router.post('/verify-code', protect, verifyBookingCode);

// User can create bookings (client role) - kept for backward compatibility but will be deprecated
router.post('/', protect, createBooking);
router.get('/me', protect, getMyBookings);
router.post('/cancel/:id', protect, cancelBooking);
router.patch('/:id', protect, updateBooking);

// PayPal payment flow for bookings
router.post('/:id/paypal/create-order', protect, createPaypalOrder);
router.post('/:id/paypal/capture', protect, capturePaypalOrder);

// Admin actions
router.get('/all', protect, authorize('admin'), getAllBookings);
router.post('/approve/:id', protect, authorize('admin'), approveBooking);
router.post('/reject/:id', protect, authorize('admin'), rejectBooking);
router.post('/complete/:id', protect, authorize('admin'), completeBooking);
router.patch('/:id/suppliers', protect, authorize('admin'), assignSuppliersToBooking);

export default router;
