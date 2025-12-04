import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import {
  getPermissions,
  updatePermission,
  resetPermissions,
} from '../controllers/permission.controller.js';

const router = express.Router();

// All authenticated users can read permissions to let the client
// enforce capabilities at runtime.
router.get('/', protect, getPermissions);

// Only admins can change role permissions.
router.put('/', protect, authorize('admin'), updatePermission);

// Reset all permissions back to server-defined defaults.
router.post('/reset', protect, authorize('admin'), resetPermissions);

export default router;
