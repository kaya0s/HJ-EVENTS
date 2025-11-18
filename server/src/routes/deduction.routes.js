import express from 'express';
import { getDeductions, upsertDeductions } from '../controllers/deduction.controller.js';
import { authorize, protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', getDeductions);
router.put('/', protect, authorize('admin'), upsertDeductions);

export default router;
