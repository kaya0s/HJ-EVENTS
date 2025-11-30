import User from '../models/user.model.js';
import Supplier from '../models/supplier.model.js';
import bcrypt from 'bcryptjs';
import ActivityLog from '../models/activityLog.model.js';
import cloudinary from '../utils/cloudinary.js';
import { updateByUpdatedAt, unconditionalUpdate } from '../utils/concurrency.js';

// Helper to upload buffer to Cloudinary and return secure_url
const uploadBufferToCloudinary = async (buffer) => {
  const dataUri = `data:image/jpeg;base64,${buffer.toString('base64')}`;
  const result = await cloudinary.uploader.upload(dataUri, { folder: 'hj-events/profiles' });
  return result.secure_url;
};

/**
 * @desc   Create supplier account (admin only)
 * @method POST
 * @access Admin
 */
export const createSupplierAccount = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (!fullName) {
      return res.status(400).json({ message: 'Full name is required' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create supplier user account
    const newSupplier = new User({
      fullName: fullName,
      email,
      password: hashedPassword,
      role: 'supplier',
    });

    await newSupplier.save();

    // Create corresponding Supplier document for business details
    const supplierProfile = new Supplier({
      name: fullName,
      category: 'Uncategorized', // Default category, can be updated later
      contactInfo: {
        email: email,
      },
    });

    await supplierProfile.save();

    // Log activity
    await ActivityLog.create({
      actor: req.user._id,
      actorName: req.user.fullName,
      action: 'Created supplier account',
      details: `Supplier: ${email}`,
    });

    res.status(201).json({
      message: 'Supplier account created successfully',
      user: {
        _id: newSupplier._id,
        email: newSupplier.email,
        role: newSupplier.role,
        fullName: newSupplier.fullName,
      },
    });
  } catch (error) {
    console.error('Create supplier account error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route '/api/me
 */

/**
 * @desc   get Profile Picture
 * @method  POST
 * @access all
 */
export const getProfile = async (req, res) => {
  res.json({ user: req.user });
};

/**
 * @desc   update Profile
 * @method  PUT
 * @access all
 */
export const updateProfile = async (req, res) => {
  try {
    const updates = {};
    const data = req.body || {};

    // Handle text fields
    if (data.fullName) updates.fullName = data.fullName.trim();
    if (data.email) updates.email = data.email.trim().toLowerCase();
    if (data.phone) updates.phone = data.phone.trim();
    if (data.address) updates.address = data.address.trim();

    // Handle profile picture upload
    if (req.file && req.file.buffer) {
      try {
        const imageURL = await uploadBufferToCloudinary(req.file.buffer);
        updates.profilePic = imageURL;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload profile picture' });
      }
    }

    // Concurrency: if client provides lastKnownUpdatedAt, use timestamp-based optimistic concurrency
    const { lastKnownUpdatedAt } = req.body || {};
    let user;
    if (lastKnownUpdatedAt) {
      try {
        user = await updateByUpdatedAt(User, { _id: req.user._id }, lastKnownUpdatedAt, updates, {
          new: true,
          projection: '-password',
        });
      } catch (err) {
        console.error('Error in updateByUpdatedAt', err);
        return res.status(400).json({ message: 'Invalid lastKnownUpdatedAt' });
      }
      if (!user) {
        const fresh = await User.findById(req.user._id).select('-password');
        return res.status(409).json({ message: 'Profile was updated by someone else. Please refresh and try again.', user: fresh });
      }
    } else {
      // Fallback: unconditional update for older clients or when concurrency not required
      user = await unconditionalUpdate(User, { _id: req.user._id }, updates, { new: true, projection: '-password' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await ActivityLog.create({
      actor: req.user._id,
      actorName: req.user.fullName,
      action: 'Update profile',
    });

    res.json({ user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc   Change password
 * @method  PUT
 * @access all
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    if (user.password) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    await ActivityLog.create({
      actor: req.user._id,
      actorName: req.user.fullName,
      action: 'Change password',
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc   list users
 * @method  GET
 * @access Admin
 */
export const listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc   update info
 * @method  PUT
 * @access all
 */
export const updateUser = async (req, res) => {
  try {
    const { lastKnownUpdatedAt, ...rawUpdates } = req.body || {};
    const updates = { ...rawUpdates };
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }
    // Prevent granting admin role via admin update endpoint to avoid privilege escalation
    if (updates.role === 'admin') {
      return res.status(403).json({ message: 'Cannot grant admin role via this endpoint' });
    }
    // Prevent administrators from modifying their own role (avoid accidental lockout)
    if (req.user && req.user._id && req.user._id.toString() === req.params.id && updates.role) {
      return res.status(403).json({ message: 'You cannot change your own role' });
    }
    // lastKnownUpdatedAt already destructured; reuse it
    let user;
    if (lastKnownUpdatedAt) {
      try {
        user = await updateByUpdatedAt(User, { _id: req.params.id }, lastKnownUpdatedAt, updates, { new: true, projection: '-password' });
      } catch (err) {
        console.error('Error in updateByUpdatedAt (admin update user)', err);
        return res.status(400).json({ message: 'Invalid lastKnownUpdatedAt' });
      }
      if (!user) {
        const fresh = await User.findById(req.params.id).select('-password');
        return res.status(409).json({ message: 'User was updated by someone else. Please refresh', user: fresh });
      }
    } else {
      user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: `Server error${error}` });
  }
};

/**
 * @desc   delete user
 * @method  DELETE
 * @access Admin
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // If deleting a supplier account, also delete from Supplier collection
    if (user.role === 'supplier') {
      await Supplier.findOneAndDelete({ 'contactInfo.email': user.email });
    }

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    await ActivityLog.create({
      actor: req.user._id,
      actorName: req.user.fullName,
      action: 'Deleted user',
      details: `Deleted user: ${user.email}`,
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: `Server error${error}` });
  }
};
