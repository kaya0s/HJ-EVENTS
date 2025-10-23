import express from 'express';
import {
  createCouple,
  getAllCouples,
  getCoupleById,
  updateCouple,
  deleteCouple,
} from '../controllers/couple.controller.js';

import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Create couple (Admin or client)
router.post('/', protect, authorize('admin', 'client'), createCouple);

// Get all couples (Admin only)
router.get('/', protect, authorize('admin'), getAllCouples);

// Get one couple
router.get('/:id', protect, authorize('admin', 'client'), getCoupleById);

// Update couple details
router.put('/:id', protect, authorize('admin', 'client'), updateCouple);

// Delete couple (Admin)
router.delete('/:id', protect, authorize('admin'), deleteCouple);

export default router;
