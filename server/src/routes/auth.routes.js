import express from 'express';
import User from '../models/user.model.js';
import { generateToken } from '../utils/token.js';
import bcrypt from 'bcryptjs';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../utils/email.js';
import { generateResetCode, generateResetToken, hashResetToken, verifyResetToken,} from '../utils/passwordReset.js';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { verify } from 'crypto';

const router = express.Router()

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.SERVER_URL || 'http://localhost:3000'}/api/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google OAuth Profile:', profile);
    
    // Check if user already exists
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      return done(null, user);
    }
    
    // Check if user exists with same email
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    if (email) {
      user = await User.findOne({ email });
      
      if (user) {
        // Link Google account to existing user
        user.googleId = profile.id;
        user.profilePic = profile.photos && profile.photos[0] ? profile.photos[0].value : '';
        await user.save();
        return done(null, user);
      }
    }
    
    // Create new user
    user = new User({
      googleId: profile.id,
      fullName: profile.displayName || 'Google User',
      email: email || '',
      profilePic: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
      isEmailVerified: true
    });
    
    await user.save();
    return done(null, user);
  } catch (error) {
    console.error('Google OAuth Strategy Error:', error);
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

//Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    if(!email||!password) return res.status(400).json({message:"Invalid Credentials"})

    try {
      
        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

    // Ensure the account has a local password set. If not (e.g. OAuth-only user),
    // calling bcrypt.compare with undefined will throw "Illegal arguments: string, undefined".
    if (!user.password) {
      return res.status(400).json({ message: 'This account does not have a local password. Please sign in with Google or set a password.' });
    }

    // Compare provided password with hashed password (await the promise)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
        generateToken(user._id, res);
        return res.status(200).json({message:"Successfully Logged in!",user}
        )

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

//register
router.post("/register",async (req, res) => {
  const { firstName,lastName, email, password } = req.body;
  try {
    if (!firstName||!lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName:firstName+" "+lastName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // generate jwt token here
      generateToken(newUser._id, res);
      await newUser.save();


      res.status(201).json({message:"Successfully created an account",user:{
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      }});
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// Forgot Password - Send reset code
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset code and token
    const resetCode = generateResetCode();
    const resetToken = generateResetToken();
    
    // Save reset token and expiry (15 minutes)
    user.resetPasswordToken = hashResetToken(resetToken);
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  user.resetCode = resetCode;
  user.resetPasswordToken = resetToken
    await user.save();

    // Send email with reset code
    const emailResult = await sendPasswordResetEmail(email, resetCode);
    
    if (emailResult.success) {
      res.status(200).json({ 
        message: 'Reset code sent to your email',
        resetToken // Send token to client for verification
      });
      console.log('Reset Token (for testing):', resetToken);
      console.log('Reset Code (for testing):', resetCode);
      
    } else {
      res.status(500).json({ message: 'Failed to send reset email' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset Password - Verify code and update password
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, code, newPassword } = req.body;

    if (!resetToken || !code || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      console.log(resetToken);
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Verify reset code
    if (code !== user.resetCode) {
      return res.status(400).json({ message: 'Invalid reset code' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password and clear reset fields
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.resetCode = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Google OAuth Routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }),
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
        role: req.user.role
      };
      
      // Redirect to frontend with success
      res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }
  }
);

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.status(200).json({ message: 'Logged out successfully' });
});

// PUT update user
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



export default router;
