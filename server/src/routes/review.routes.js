import express from 'express';
import { createReview, getAllReviews, updateReview } from '../controllers/review.controller.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/', getAllReviews);
router.put('/:id', protect, updateReview);

export default router;
