import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import {
  getProfile,
  updateProfile,
  listUsers,
  updateUser,
  createSupplierAccount,
  deleteUser,
} from '../controllers/user.controller.js';
const router = express.Router();

router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);

// Admin - specific routes first
router.post('/supplier-account', protect, authorize('admin'), createSupplierAccount);
router.get('/', protect, authorize('admin'), listUsers);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

export default router;
