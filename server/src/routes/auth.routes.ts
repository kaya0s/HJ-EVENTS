import express from 'express';
import {login,register,me,logout}  from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

//current user route (protected)
router.get('/me', authenticateToken, me);

// Register route
router.post('/register',register);

// Login route
router.post('/login',login);

// Logout route
router.post('/logout',logout);

export default router;