import User from '../models/user.model.js';
import Supplier from '../models/supplier.model.js';
import bcrypt from 'bcryptjs';
import ActivityLog from '../models/activityLog.model.js';

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
    const updates = req.body;
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select(
      '-password'
    );
    await ActivityLog.create({
      actor: req.user._id,
      actorName: req.user.fullName,
      action: 'Update profile',
    });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: `server error${error}` });
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
    const updates = req.body;
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select(
      '-password'
    );
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
