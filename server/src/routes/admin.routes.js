import express from 'express';
import { protect, isAdmin } from '../middlewares/auth.js';
import { getDashboard, getMonthlyRevenue } from '../controllers/reports.controller.js';
import { getActivityLogs } from '../controllers/admin.controller.js';
import { listAnnouncements } from '../controllers/announcement.controller.js';

const router = express.Router();

// Admin-only
router.get('/dashboard', protect, isAdmin, getDashboard);
router.get('/revenue', protect, isAdmin, getMonthlyRevenue);
router.get('/activity', protect, isAdmin, getActivityLogs);

// Public: announcements
router.get('/announcements', listAnnouncements);

export default router;
