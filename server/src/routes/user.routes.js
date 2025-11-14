import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';
import {
  getProfile,
  updateProfile,
  changePassword,
  listUsers,
  updateUser,
  createSupplierAccount,
  deleteUser,
} from '../controllers/user.controller.js';
const router = express.Router();

router.get('/me', protect, getProfile);
router.put('/me', protect, upload.single('profilePic'), updateProfile);
router.put('/me/password', protect, changePassword);

// Admin - specific routes first
router.post('/supplier-account', protect, authorize('admin'), createSupplierAccount);
router.get('/', protect, authorize('admin'), listUsers);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

export default router;
