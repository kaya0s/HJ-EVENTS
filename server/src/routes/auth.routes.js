import express from 'express';
import { generateToken } from '../utils/token.js';
import passport from 'passport';
import {
  Login,
  Register,
  ForgotPassword,
  verifyResetCode,
  NewPassword,
  checkAuth,
  Logout,
} from '../controllers/auth.controller.js';

const router = express.Router();

// Google OAuth Routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`,
  }),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
      }

      // Generate JWT token for the authenticated user
      const token = generateToken(req.user._id, res);

      // Return user data and redirect to frontend
      const userData = {
        _id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        profilePic: req.user.profilePic,
        role: req.user.role,
      };

      // Redirect to frontend with success
      res.redirect(
        `${process.env.CLIENT_URL}/auth/success?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`
      );
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }
  }
);

router.get('/check', checkAuth);
router.post('/login', Login);
router.post('/register', Register);
router.post('/forgot-password', ForgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/new-password', NewPassword);

// Logout
router.post('/logout', Logout);

export default router;
