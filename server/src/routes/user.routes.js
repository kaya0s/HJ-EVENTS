import express from 'express';
import { protect, isAdmin } from '../middlewares/auth.js';
import { getProfile, updateProfile, listUsers, updateUser } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);

// Admin
router.get('/', protect, isAdmin, listUsers);
router.put('/:id', protect, isAdmin, updateUser);

export default router;
