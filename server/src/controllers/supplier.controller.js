/*eslint no-unused-vars: "off"*/

import Supplier from '../models/supplier.model.js';
import cloudinary from '../utils/cloudinary.js';
import Booking from '../models/booking.model.js';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { sendSupplierCredentialsEmail } from '../utils/email.js';
import { createPdfId, streamBookingsPdf } from '../utils/pdfReports.js';

const normalizeDateInput = (value) => {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (
      (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      (trimmed.startsWith('{') && trimmed.endsWith('}'))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed;
        if (parsed && Array.isArray(parsed.unavailableDates)) {
          return parsed.unavailableDates;
        }
      } catch (error) {
        // ignore parse error, fallback to comma split
      }
    }
    return trimmed
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [value];
};

const extractUnavailableDates = (body) => {
  const values = [];
  let provided = false;

  const addValue = (val) => {
    if (val === undefined || val === null) return;
    provided = true;
    values.push(val);
  };

  addValue(body.unavailableDates);
  addValue(body['unavailableDates[]']);

  Object.keys(body || {}).forEach((key) => {
    if (/^unavailableDates\[\d+\]$/i.test(key)) {
      addValue(body[key]);
    }
  });

  if (!provided) {
    return { provided: false, dates: [] };
  }

  const collected = values
    .flatMap((value) => normalizeDateInput(value))
    .filter((value) => value !== undefined && value !== null && String(value).trim() !== '');

  const uniqueIsoDates = Array.from(
    new Set(
      collected
        .map((value) => {
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return null;
          const isoDate = date.toISOString().split('T')[0];
          return isoDate;
        })
        .filter(Boolean)
    )
  );

  const dates = uniqueIsoDates.map((iso) => new Date(`${iso}T00:00:00.000Z`));

  return { provided: true, dates };
};

// Helper to upload buffer to Cloudinary and return secure_url
const uploadBufferToCloudinary = async (buffer, filename = 'upload') => {
  // Convert buffer to data URI
  const dataUri = `data:image/jpeg;base64,${buffer.toString('base64')}`;
  const result = await cloudinary.uploader.upload(dataUri, { folder: 'hj-events/suppliers' });
  return result.secure_url;
};

export const createSupplier = async (req, res) => {
  try {
    const data = req.body || {};

    const accountEmail = (
      data.accountEmail ||
      data['account[email]'] ||
      data['accountEmail[]'] ||
      ''
    )
      .toLowerCase()
      .trim();
    const accountPassword = data.accountPassword || data['account[password]'] || '';
    const accountFullName =
      data.accountFullName || data['account[fullName]'] || data.name || 'New Supplier';

    if (!accountEmail || !accountPassword) {
      return res.status(400).json({ message: 'Supplier login email and password are required.' });
    }

    if (accountPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await User.findOne({ email: accountEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already associated with another account.' });
    }

    const hashedPassword = await bcrypt.hash(accountPassword, 10);

    // Reconstruct nested contactInfo from flattened FormData
    const supplierData = {
      name: data.name,
      category: data.category,
      description: data.description || '',
      priceRange: data.priceRange || '',
      contactInfo: {
        phone: data['contactInfo[phone]'] || data.contactInfo?.phone || '',
        email: data['contactInfo[email]'] || data.contactInfo?.email || accountEmail,
        address: data['contactInfo[address]'] || data.contactInfo?.address || '',
      },
      unavailableDates: extractUnavailableDates(data).dates,
    };

    // If file buffer available, upload to cloudinary and set imageURL
    if (req.file && req.file.buffer) {
      const imageURL = await uploadBufferToCloudinary(req.file.buffer, req.file.originalname);
      supplierData.imageURL = imageURL;
    }

    let newUser = null;
    try {
      newUser = await User.create({
        fullName: accountFullName,
        email: accountEmail,
        password: hashedPassword,
        role: 'supplier',
        phone: supplierData.contactInfo.phone || '',
        address: supplierData.contactInfo.address || '',
        isEmailVerified: true,
      });
    } catch (error) {
      console.error('Error creating supplier user', error.message);
      return res.status(500).json({ message: 'Failed to create supplier user account.' });
    }

    supplierData.user = newUser._id;

    try {
      const supplier = new Supplier(supplierData);
      await supplier.save();
      try {
        await sendSupplierCredentialsEmail({
          email: accountEmail,
          password: accountPassword,
          fullName: accountFullName,
          loginUrl: `${process.env.CLIENT_URL || ''}/login`,
        });
      } catch (emailError) {
        console.error('Failed to send supplier credentials email:', emailError);
      }
      res.status(201).json({ supplier });
    } catch (error) {
      if (newUser?._id) {
        await User.findByIdAndDelete(newUser._id);
      }
      console.error('Create supplier error', error.message);
      return res.status(500).json({ message: 'Server error' });
    }
  } catch (error) {
    console.error('Create supplier error', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const listSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({}).sort('-createdAt').populate('user', 'fullName email');
    res.json({ suppliers });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id).populate('user', 'fullName email');
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json({ supplier });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const data = req.body || {};

    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

    const unavailableDatesResult = extractUnavailableDates(data);

    const updates = {
      name: data.name ?? supplier.name,
      category: data.category ?? supplier.category,
      description: data.description ?? supplier.description,
      priceRange: data.priceRange ?? supplier.priceRange,
      contactInfo: {
        phone:
          data['contactInfo[phone]'] ??
          data.contactInfo?.phone ??
          supplier.contactInfo?.phone ??
          '',
        email:
          data['contactInfo[email]'] ??
          data.contactInfo?.email ??
          supplier.contactInfo?.email ??
          '',
        address:
          data['contactInfo[address]'] ??
          data.contactInfo?.address ??
          supplier.contactInfo?.address ??
          '',
      },
    };

    if (unavailableDatesResult.provided) {
      updates.unavailableDates = unavailableDatesResult.dates;
    }

    // Remove undefined fields
    Object.keys(updates).forEach((key) => {
      if (updates[key] === undefined || updates[key] === null) delete updates[key];
    });

    if (req.file && req.file.buffer) {
      const imageURL = await uploadBufferToCloudinary(req.file.buffer, req.file.originalname);
      updates.imageURL = imageURL;
    }

    const userUpdate = {};
    let user = supplier.user ? await User.findById(supplier.user) : null;

    const accountEmailRaw = (
      data.accountEmail ||
      data['account[email]'] ||
      data['accountEmail[]'] ||
      ''
    ).trim();
    const accountEmail = accountEmailRaw ? accountEmailRaw.toLowerCase() : '';
    const accountFullName = data.accountFullName || data['account[fullName]'] || '';
    const accountPassword = data.accountPassword || data['account[password]'] || '';

    let createdNewUser = false;
    let credentialsToEmail = null;

    if (!user && accountEmail) {
      const existingUser = await User.findOne({ email: accountEmail });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: 'Email is already associated with another account.' });
      }
      if (!accountPassword || accountPassword.length < 6) {
        return res.status(400).json({
          message: 'Password must be at least 6 characters long to create a supplier account.',
        });
      }
      const hashedPassword = await bcrypt.hash(accountPassword, 10);
      const newUser = await User.create({
        fullName: accountFullName || supplier.name || 'Supplier',
        email: accountEmail,
        password: hashedPassword,
        role: 'supplier',
        phone: updates.contactInfo.phone || '',
        address: updates.contactInfo.address || '',
        isEmailVerified: true,
      });
      supplier.user = newUser._id;
      user = newUser;
      createdNewUser = true;
      updates.contactInfo.email = accountEmail || updates.contactInfo.email;
      credentialsToEmail = {
        email: accountEmail,
        password: accountPassword,
        fullName: accountFullName || supplier.name || '',
      };
    }

    if (accountEmail && user) {
      if (accountEmail !== user.email) {
        const existingUser = await User.findOne({ email: accountEmail });
        if (existingUser && existingUser._id.toString() !== user._id.toString()) {
          return res
            .status(400)
            .json({ message: 'Email is already associated with another account.' });
        }
        userUpdate.email = accountEmail;
        updates.contactInfo.email = accountEmail;
      }
    }

    if (accountFullName && user) {
      userUpdate.fullName = accountFullName;
    }

    if (accountPassword && !createdNewUser) {
      if (accountPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
      }
      userUpdate.password = await bcrypt.hash(accountPassword, 10);
      credentialsToEmail = {
        email: accountEmail || user?.email,
        password: accountPassword,
        fullName: accountFullName || userUpdate.fullName || user?.fullName || supplier.name || '',
      };
    }

    if (user && Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(user._id, userUpdate, { new: true });
    }

    Object.assign(supplier, updates);
    const updatedSupplier = await supplier.save();
    const populatedSupplier = await Supplier.findById(updatedSupplier._id).populate(
      'user',
      'fullName email'
    );
    if (credentialsToEmail?.email && credentialsToEmail?.password) {
      try {
        await sendSupplierCredentialsEmail({
          email: credentialsToEmail.email,
          password: credentialsToEmail.password,
          fullName: credentialsToEmail.fullName,
          loginUrl: `${process.env.CLIENT_URL || ''}/login`,
        });
      } catch (emailError) {
        console.error('Failed to send supplier credentials email:', emailError);
      }
    }
    res.json({ supplier: populatedSupplier });
  } catch (error) {
    console.error('Update supplier error', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    if (supplier.user) {
      await User.findByIdAndDelete(supplier.user);
    }
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
    const supplier = await Supplier.findOne({ user: req.user._id }).populate(
      'user',
      'fullName email phone address'
    );
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
    const supplier = await Supplier.findOne({ user: req.user._id });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const { name, description, priceRange, contactInfo = {}, category } = req.body;
    const unavailableDatesResult = extractUnavailableDates(req.body);

    if (name !== undefined) supplier.name = name;
    if (description !== undefined) supplier.description = description;
    if (priceRange !== undefined) supplier.priceRange = priceRange;
    if (category !== undefined) supplier.category = category;

    supplier.contactInfo = {
      ...supplier.contactInfo,
      ...contactInfo,
    };

    if (unavailableDatesResult.provided) {
      supplier.unavailableDates = unavailableDatesResult.dates;
    }

    await supplier.save();

    const userUpdates = {};
    if (contactInfo.phone !== undefined) userUpdates.phone = contactInfo.phone;
    if (contactInfo.address !== undefined) userUpdates.address = contactInfo.address;

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(req.user._id, userUpdates, { new: true });
    }

    const updatedSupplier = await Supplier.findById(supplier._id).populate(
      'user',
      'fullName email phone address'
    );
    res.json({
      message: 'Profile updated successfully',
      supplier: updatedSupplier,
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
    const supplier = await Supplier.findOne({ user: req.user._id });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const bookings = await Booking.find({ suppliers: supplier._id })
      .populate('user.id', 'fullName email')
      .populate('package', 'name price status')
      .populate('suppliers', 'name category');

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const downloadMyBookingsReport = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ user: req.user._id }).populate('user', 'fullName');
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier profile not found' });
    }

    const bookings = await Booking.find({ suppliers: supplier._id })
      .populate('user.id', 'fullName email')
      .populate('package', 'name')
      .lean();

    const pdfId = createPdfId();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="supplier-bookings-${pdfId}.pdf"`);
    res.setHeader('X-Report-Id', pdfId);

    streamBookingsPdf({
      bookings,
      res,
      title: 'Assigned Booking Report',
      subtitle: supplier.name ? `${supplier.name} · Supplier Summary` : 'Supplier Summary',
      generatedBy: supplier.user?.fullName || req.user.fullName || 'Supplier User',
      pdfId,
    });
  } catch (error) {
    console.error('Supplier bookings PDF error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to generate supplier booking report' });
    }
  }
};

/**
 * @desc   Update booking status (Accepted, In Progress, Completed, etc.)
 * @route  PATCH /api/suppliers/booking/:bookingId/status
 * @access Supplier
 */
export const updateBookingStatus = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ user: req.user._id });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const { bookingId } = req.params;
    const { status } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      suppliers: supplier._id,
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or not assigned to you' });
    }

    booking.status = status;
    await booking.save();

    res.json({ message: 'Booking status updated', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
