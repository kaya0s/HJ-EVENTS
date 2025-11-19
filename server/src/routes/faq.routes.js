import express from 'express';
import { getFaqs, createFaq, updateFaq, deleteFaq } from '../controllers/faq.controller.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', getFaqs);
router.post('/', protect, authorize('admin'), createFaq);
router.put('/:id', protect, authorize('admin'), updateFaq);
router.delete('/:id', protect, authorize('admin'), deleteFaq);

export default router;
