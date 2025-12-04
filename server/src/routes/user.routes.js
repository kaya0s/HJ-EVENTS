import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { checkProfilePermission } from '../middlewares/permissions.js';
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
// Update profile requires updateProfile permission for users, manageProducts for suppliers
router.put('/me', protect, checkProfilePermission(), upload.single('profilePic'), updateProfile);
router.put('/me/password', protect, checkProfilePermission(), changePassword);

// Admin - specific routes first
router.post('/supplier-account', protect, authorize('admin'), createSupplierAccount);
router.get('/', protect, authorize('admin'), listUsers);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

export default router;
