import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { checkPermission } from '../middlewares/permissions.js';
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

// Booking verification endpoints - require submitRequests permission
router.post(
  '/send-verification',
  protect,
  checkPermission('user', 'submitRequests'),
  sendBookingVerificationCode
);
router.post('/verify-code', protect, checkPermission('user', 'submitRequests'), verifyBookingCode);

// User can create bookings (client role) - require submitRequests permission
router.post('/', protect, checkPermission('user', 'submitRequests'), createBooking);
// User can view bookings - require viewBookings permission
router.get('/me', protect, checkPermission('user', 'viewBookings'), getMyBookings);
router.post('/cancel/:id', protect, checkPermission('user', 'viewBookings'), cancelBooking);
router.patch('/:id', protect, checkPermission('user', 'viewBookings'), updateBooking);

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
