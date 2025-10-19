import express from 'express';
import { protect, isAdmin } from '../middlewares/auth.js';
import { getDashboard, getMonthlyRevenue } from '../controllers/reports.controller.js';

import {
  postAnnouncement,
  listAnnouncements,
  getActivityLogs,
} from '../controllers/announcement.controller.js';

const router = express.Router();

// Admin-only
router.get('/dashboard', protect, isAdmin, getDashboard);
router.get('/revenue', protect, isAdmin, getMonthlyRevenue);
router.get('/activity', protect, isAdmin, getActivityLogs);
router.post('/announcement', protect, isAdmin, postAnnouncement);

// Public: announcements
router.get('/announcements', listAnnouncements);

export default router;
