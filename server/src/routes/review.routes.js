import express from 'express';
import { createReview, getAllReviews } from '../controllers/review.controller.js';

const router = express.Router();

// Public
router.post('/', createReview);
router.get('/', getAllReviews);

export default router;
