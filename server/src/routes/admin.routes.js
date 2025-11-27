import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import {
  getDashboard,
  getMonthlyRevenue,
  downloadBookingsReport,
} from '../controllers/reports.controller.js';
import {
  postAnnouncement,
  listAnnouncements,
  getActivityLogs,
} from '../controllers/announcement.controller.js';

const router = express.Router();

// Admin-only
router.get('/dashboard', protect, authorize('admin'), getDashboard);
router.get('/revenue', protect, authorize('admin'), getMonthlyRevenue);
router.get('/activity', protect, authorize('admin'), getActivityLogs);
router.post('/announcement', protect, authorize('admin'), postAnnouncement);
router.get('/reports/bookings/pdf', protect, authorize('admin'), downloadBookingsReport);

// Public: announcements
router.get('/announcements', listAnnouncements);

export default router;
