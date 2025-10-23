import express from 'express';
import {
  createFeedback,
  listFeedbacks,
  getFeedback,
  updateFeedback,
  deleteFeedback,
} from '../controllers/feedback.controller.js';

const router = express.Router();

// Public
router.post('/', createFeedback);
router.get('/', listFeedbacks);
router.get('/:id', getFeedback);
router.put('/:id', updateFeedback);
router.delete('/:id', deleteFeedback);

export default router;
