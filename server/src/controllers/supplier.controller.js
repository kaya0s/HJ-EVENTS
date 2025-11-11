/*eslint no-unused-vars: "off"*/

import Supplier from '../models/supplier.model.js';
import cloudinary from '../utils/cloudinary.js';
import Booking from '../models/booking.model.js';

// Helper to upload buffer to Cloudinary and return secure_url
const uploadBufferToCloudinary = async (buffer, filename = 'upload') => {
  // Convert buffer to data URI
  const dataUri = `data:image/jpeg;base64,${buffer.toString('base64')}`;
  const result = await cloudinary.uploader.upload(dataUri, { folder: 'suppliers' });
  return result.secure_url;
};

export const createSupplier = async (req, res) => {
  try {
    const data = req.body || {};

    // Reconstruct nested contactInfo from flattened FormData
    const supplierData = {
      name: data.name,
      category: data.category,
      description: data.description || '',
      priceRange: data.priceRange || '',
      contactInfo: {
        phone: data['contactInfo[phone]'] || data.contactInfo?.phone || '',
        email: data['contactInfo[email]'] || data.contactInfo?.email || '',
        address: data['contactInfo[address]'] || data.contactInfo?.address || '',
      },
    };

    // If file buffer available, upload to cloudinary and set imageURL
    if (req.file && req.file.buffer) {
      const imageURL = await uploadBufferToCloudinary(req.file.buffer, req.file.originalname);
      supplierData.imageURL = imageURL;
    }

    const supplier = new Supplier(supplierData);
    await supplier.save();
    res.status(201).json({ supplier });
  } catch (error) {
    console.error('Create supplier error', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const listSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({}).sort('-createdAt');
    res.json({ suppliers });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json({ supplier });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const data = req.body || {};

    // Reconstruct nested contactInfo from flattened FormData
    const updates = {
      name: data.name,
      category: data.category,
      description: data.description,
      priceRange: data.priceRange,
      contactInfo: {
        phone: data['contactInfo[phone]'] || data.contactInfo?.phone || '',
        email: data['contactInfo[email]'] || data.contactInfo?.email || '',
        address: data['contactInfo[address]'] || data.contactInfo?.address || '',
      },
    };

    // Remove undefined fields
    Object.keys(updates).forEach((key) => {
      if (updates[key] === undefined) delete updates[key];
    });

    if (req.file && req.file.buffer) {
      const imageURL = await uploadBufferToCloudinary(req.file.buffer, req.file.originalname);
      updates.imageURL = imageURL;
    }

    const supplier = await Supplier.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json({ supplier });
  } catch (error) {
    console.error('Update supplier error', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json({ message: 'Supplier deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc   Get logged-in supplier profile
 * @route  GET /api/suppliers/my-profile
 * @access Supplier
 */
export const getMyProfile = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.user.id).select('-password'); // exclude password
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc   Update supplier profile
 * @route  PUT /api/suppliers/my-profile
 * @access Supplier
 */
export const updateMyProfile = async (req, res) => {
  try {
    const updates = req.body;

    const supplier = await Supplier.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      supplier,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc   Get all bookings assigned to this supplier
 * @route  GET /api/suppliers/my-bookings
 * @access Supplier
 */
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ supplier: req.user.id })
      .populate('client', 'name email')
      .populate('package', 'name price status');

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc   Update booking status (Accepted, In Progress, Completed, etc.)
 * @route  PATCH /api/suppliers/booking/:bookingId/status
 * @access Supplier
 */
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      supplier: req.user.id, // ensure supplier owns it
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or not yours' });
    }

    booking.status = status;
    await booking.save();

    res.json({ message: 'Booking status updated', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
