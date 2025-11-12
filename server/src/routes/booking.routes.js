import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import {
  createBooking,
  getMyBookings,
  cancelBooking,
  approveBooking,
  rejectBooking,
  getBookedDates,
  getAllBookings,
  assignSuppliersToBooking,
} from '../controllers/booking.controller.js';

const router = express.Router();

// Public route for availability calendar
router.get('/availability', getBookedDates);

// User can create bookings (client role)
router.post('/', protect, createBooking);
router.get('/me', protect, getMyBookings);
router.post('/cancel/:id', protect, cancelBooking);

// Admin actions
router.get('/all', protect, authorize('admin'), getAllBookings);
router.post('/approve/:id', protect, authorize('admin'), approveBooking);
router.post('/reject/:id', protect, authorize('admin'), rejectBooking);
router.patch('/:id/suppliers', protect, authorize('admin'), assignSuppliersToBooking);

export default router;
