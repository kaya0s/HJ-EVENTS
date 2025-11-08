import express from 'express';
import {
  Login,
  Register,
  ForgotPassword,
  verifyResetCode,
  NewPassword,
  checkAuth,
  Logout,
  googleAuth,
  googleAuthCallback,
} from '../controllers/auth.controller.js';

const router = express.Router();
//Google OAuth Routes
router.get('/google', googleAuth);
router.get('/google/callback', googleAuthCallback);

// Authentication Routes

router.get('/check', checkAuth);
router.post('/login', Login);
router.post('/register', Register);
router.post('/forgot-password', ForgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/new-password', NewPassword);

// Logout
router.post('/logout', Logout);

export default router;
