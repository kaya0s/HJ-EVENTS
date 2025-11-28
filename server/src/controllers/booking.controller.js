import Booking from '../models/booking.model.js';
import Package from '../models/package.model.js';
import ActivityLog from '../models/activityLog.model.js';
import paypalSdk from '../utils/paypal.js';
import ExternalSupplierDeduction from '../models/externalSupplierDeduction.model.js';
import {
  sendBookingApprovalEmail,
  sendBookingRejectionEmail,
  sendBookingVerificationEmail,
} from '../utils/email.js';
import { generateResetCode } from '../utils/passwordReset.js';

const normalizeCategoryKey = (value = '') => value.trim().toLowerCase();

// In-memory store for booking verification codes
// Format: { userId: { code: string, expiresAt: Date, bookingData: object } }
const bookingVerificationStore = new Map();

// Clean up expired codes every 5 minutes
setInterval(
  () => {
    const now = new Date();
    for (const [userId, data] of bookingVerificationStore.entries()) {
      if (data.expiresAt < now) {
        bookingVerificationStore.delete(userId);
      }
    }
  },
  5 * 60 * 1000
);

const ensureBookingTitle = (booking) => {
  if (!booking) return;
  if (!booking.title) {
    const fallbackTitle =
      booking.package?.name ||
      (booking.user?.fullName ? `${booking.user.fullName}'s Wedding` : 'Untitled Wedding');
    booking.title = fallbackTitle;
  }
};

const autoExpirePendingBookings = async (extraFilter = {}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const filter = {
    status: 'pending',
    weddingDate: { $lt: today },
    ...extraFilter,
  };
  await Booking.updateMany(filter, { status: 'expired' });
};

/**
 * @desc --
 * @route '/api/booking'
 */

/**
 * @desc   Create Booking
 * @method  POST
 * @access client
 */
export const createBooking = async (req, res) => {
  try {
    const { packageId, eventDate, title, venue, suppliers, externalSuppliers } = req.body;

    if (!packageId || !eventDate || !title || !venue) {
      return res.status(400).json({
        message: 'Missing required fields: packageId, eventDate, title, and venue are required',
      });
    }

    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'You are not authorized to create a booking' });
    }

    const pkg = await Package.findById(packageId);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });

    // Check if date is at least 15 days in advance
    const eventDateObj = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + 15);

    if (eventDateObj < minDate) {
      return res.status(400).json({
        message: 'Bookings must be made at least 15 days in advance',
      });
    }

    // Check if date is already booked
    const startOfDay = new Date(eventDateObj);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(eventDateObj);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBooking = await Booking.findOne({
      weddingDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: 'accepted',
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'This date is already booked' });
    }

    const rawExternalSelections = Array.isArray(externalSuppliers)
      ? externalSuppliers
          .map((category) => {
            const label = typeof category === 'string' ? category.trim() : '';
            const key = normalizeCategoryKey(label);
            if (!key) return null;
            return { key, label: label || key };
          })
          .filter(Boolean)
      : [];

    const uniqueExternalSelections = [];
    const seenExternalKeys = new Set();
    rawExternalSelections.forEach((selection) => {
      if (seenExternalKeys.has(selection.key)) return;
      seenExternalKeys.add(selection.key);
      uniqueExternalSelections.push(selection);
    });

    let externalSelectionEntries = [];
    if (uniqueExternalSelections.length > 0) {
      const docs = await ExternalSupplierDeduction.find({
        categoryKey: { $in: uniqueExternalSelections.map((sel) => sel.key) },
      }).lean();

      const docMap = docs.reduce((acc, doc) => {
        acc[doc.categoryKey] = doc;
        return acc;
      }, {});

      externalSelectionEntries = uniqueExternalSelections.map((selection) => {
        const matched = docMap[selection.key];
        return {
          category: selection.label || matched?.label || selection.key,
          deductionAmount: matched?.amount || 0,
        };
      });
    }

    const basePrice = Number(pkg.price) || 0;
    const totalDeduction = externalSelectionEntries.reduce(
      (sum, entry) => sum + (Number(entry.deductionAmount) || 0),
      0
    );
    const totalPrice = Math.max(0, basePrice - totalDeduction);

    const booking = new Booking({
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email || '',
        phone: req.user.phone || '',
        address: req.user.address || '',
      },
      title: title.trim(),
      venue: venue.trim(),
      package: pkg._id,
      weddingDate: new Date(eventDate),
      suppliers: Array.isArray(suppliers) ? suppliers : [],
      basePrice,
      totalPrice,
      payment: {
        status: 'pending',
        amount: totalPrice,
        currency: 'PHP',
      },
      externalSupplierSelections: externalSelectionEntries,
    });

    await booking.save();

    // Log activity
    await ActivityLog.create({
      actor: req.user._id,
      actorName: req.user.fullName,
      action: 'Create booking',
      details: `Booking ${booking._id}`,
    });

    // Populate suppliers for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('suppliers', 'name category rating')
      .populate('package');

    res.status(201).json({ booking: populatedBooking });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc   Get my Booking
 * @method  GET
 * @access Client
 */
export const getMyBookings = async (req, res) => {
  try {
    await autoExpirePendingBookings({ 'user.id': req.user._id });
    const bookings = await Booking.find({ 'user.id': req.user._id })
      .populate('package')
      .populate('suppliers', 'name category rating')
      .populate('review', 'rating comment createdAt')
      .sort('-createdAt');
    res.json({ bookings });
    console.log(bookings);
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

/**
 * @desc   Create new feedback
 * @method  POST
 * @access Admin
 */
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, 'user.id': req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status === 'accepted')
      return res.status(400).json({ message: 'Cannot cancel an accepted booking' });
    booking.status = 'cancelled';
    await booking.save();
    res.json({ booking });
  } catch (error) {
    res.status(500).json({ message: `Server error${error}` });
  }
};

/**
 * @desc   Approve booking
 * @method  POST
 * @access Admin
 */
export const approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user.id', 'email fullName phone')
      .populate('package');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = 'accepted';
    ensureBookingTitle(booking);
    await booking.save();

    await ActivityLog.create({
      actor: req.user._id,
      actorName: req.user.fullName,
      action: 'Approve booking',
      details: `Booking ${booking._id}`,
    });

    // Send email notification to client
    if (booking.user?.id?.email) {
      try {
        const eventDate = booking.weddingDate
          ? new Date(booking.weddingDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : 'N/A';

        console.log('Sending email to:', booking.user.id.email);
        await sendBookingApprovalEmail(
          booking.user.id.email,
          booking.user.fullName || booking.user.id.fullName,
          booking._id.toString().slice(-8).toUpperCase(),
          eventDate
        );
      } catch (emailError) {
        console.error('Error sending approval email:', emailError);
      }
    }

    res.json({ booking });
  } catch (error) {
    console.error('Approve booking error:', error);
    res.status(500).json({ message: `server error ${error.message}` });
  }
};
/**
 * @desc   Reject booking
 * @method  POST
 * @access Admin
 */
export const rejectBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('user.id', 'email fullName phone')
      .populate('package');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = 'rejected';
    ensureBookingTitle(booking);
    await booking.save();

    // Send email notification to client
    if (booking.user?.id?.email) {
      try {
        await sendBookingRejectionEmail(
          booking.user.id.email,
          booking.user.fullName || booking.user.id.fullName || 'Client',
          booking._id.toString().slice(-8).toUpperCase(),
          reason || 'Booking could not be approved at this time.'
        );
      } catch (emailError) {
        console.error('Error sending rejection email:', emailError);
        // Don't fail the request if email fails
      }
    }
    await ActivityLog.create({
      actor: req.user._id,
      actorName: req.user.fullName,
      action: 'Reject booking',
      details: `Booking ${booking._id}`,
    });

    res.json({ booking });
  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({ message: `server error ${error.message}` });
  }
};

export const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user.id', 'email fullName phone')
      .populate('package');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.status !== 'accepted') {
      return res.status(400).json({ message: 'Only accepted bookings can be marked as completed' });
    }

    booking.status = 'completed';
    ensureBookingTitle(booking);
    await booking.save();

    await ActivityLog.create({
      actor: req.user._id,
      actorName: req.user.fullName,
      action: 'Complete booking',
      details: `Booking ${booking._id}`,
    });

    res.json({ booking });
  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(500).json({ message: `server error ${error.message}` });
  }
};

/**
 * @desc   Get all bookings (Admin only)
 * @method  GET
 * @access Admin
 */
export const getAllBookings = async (req, res) => {
  try {
    await autoExpirePendingBookings();
    const { status, search, startDate, endDate } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status.toLowerCase();
    }

    if (startDate || endDate) {
      query.weddingDate = {};
      if (startDate) {
        const start = new Date(startDate);
        if (!Number.isNaN(start.getTime())) {
          query.weddingDate.$gte = start;
        }
      }
      if (endDate) {
        const end = new Date(endDate);
        if (!Number.isNaN(end.getTime())) {
          query.weddingDate.$lte = end;
        }
      }
      if (Object.keys(query.weddingDate).length === 0) {
        delete query.weddingDate;
      }
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { 'user.fullName': regex },
        { 'user.email': regex },
        { 'user.phone': regex },
        { 'user.address': regex },
        { title: regex },
        { venue: regex },
      ];
    }

    const bookings = await Booking.find(query)
      .populate({
        path: 'user.id',
        select: 'fullName email phone',
      })
      .populate('package')
      .populate('suppliers', 'name category rating')
      .populate('review', 'rating comment createdAt user')
      .sort('-createdAt')
      .lean();

    // Transform bookings to ensure consistent user data structure
    const transformedBookings = bookings.map((booking) => {
      if (booking.user) {
        if (booking.user.id && typeof booking.user.id === 'object' && booking.user.id._id) {
          booking.user.email = booking.user.email || booking.user.id.email || null;
          booking.user.phone = booking.user.phone || booking.user.id.phone || '';
          if (!booking.user.fullName) {
            booking.user.fullName = booking.user.id.fullName || 'Unknown User';
          }
        } else if (!booking.user.fullName) {
          booking.user.fullName = 'Unknown User';
        }
      }

      return booking;
    });

    res.json({ bookings: transformedBookings });
  } catch (error) {
    console.error('Get all bookings error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.stack) {
      console.error(
        'Error stack (first 10 lines):',
        error.stack.split('\n').slice(0, 10).join('\n')
      );
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc   Assign suppliers to a booking
 * @method  PATCH
 * @access Admin
 */
export const assignSuppliersToBooking = async (req, res) => {
  try {
    const { suppliers } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.suppliers = suppliers || [];
    await booking.save();

    await ActivityLog.create({
      actor: req.user._id,
      actorName: req.user.fullName,
      action: 'Assign suppliers to booking',
      details: `Booking ${booking._id}`,
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('user.id', 'fullName email phone')
      .populate('package')
      .populate('suppliers', 'name category rating')
      .lean();

    // Transform booking to ensure user data is accessible
    if (populatedBooking && populatedBooking.user) {
      if (populatedBooking.user.id && typeof populatedBooking.user.id === 'object') {
        populatedBooking.user.email =
          populatedBooking.user.email || populatedBooking.user.id.email || null;
        populatedBooking.user.phone =
          populatedBooking.user.phone || populatedBooking.user.id.phone || '';
        if (!populatedBooking.user.fullName) {
          populatedBooking.user.fullName = populatedBooking.user.id.fullName || 'Unknown User';
        }
      } else if (!populatedBooking.user.fullName) {
        populatedBooking.user.fullName = 'Unknown User';
      }
    }

    res.json({ booking: populatedBooking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc   Update booking (client only)
 * @method  PATCH
 * @access Client
 */
export const updateBooking = async (req, res) => {
  try {
    const { title, venue, lastKnownUpdatedAt } = req.body;
    const booking = await Booking.findOne({ _id: req.params.id, 'user.id': req.user._id })
      .populate('package')
      .populate('suppliers', 'name category rating');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Cannot edit accepted bookings
    if (booking.status === 'accepted') {
      return res.status(400).json({ message: 'Cannot edit an accepted booking' });
    }

    // Optimistic concurrency control
    if (lastKnownUpdatedAt) {
      const clientTimestamp = new Date(lastKnownUpdatedAt).getTime();
      const serverTimestamp = new Date(booking.updatedAt).getTime();
      if (!Number.isNaN(clientTimestamp) && clientTimestamp !== serverTimestamp) {
        const freshBooking = booking.toObject({ virtuals: true });
        return res.status(409).json({
          message: 'Booking was updated by someone else. Please refresh and try again.',
          booking: freshBooking,
        });
      }
    }

    // Update only allowed fields (not weddingDate)
    if (title !== undefined) booking.title = title.trim();
    if (venue !== undefined) booking.venue = venue.trim();

    await booking.save();

    // Log activity
    await ActivityLog.create({
      actor: req.user._id,
      actorName: req.user.fullName,
      action: 'Update booking',
      details: `Booking ${booking._id}`,
    });

    res.json({ booking });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc   Get booked dates for availability calendar
 * @method  GET
 * @access Public
 */
export const getBookedDates = async (req, res) => {
  try {
    console.log('Fetching booked dates...');

    // Get only accepted bookings for availability calendar
    const bookings = await Booking.find({
      status: 'accepted',
    })
      .select('weddingDate prenuptDate')
      .lean();

    console.log(`Found ${bookings.length} bookings`);

    // Extract all booked dates
    const bookedDates = new Set();

    bookings.forEach((booking) => {
      if (booking.weddingDate) {
        try {
          const weddingDate = new Date(booking.weddingDate);
          if (!isNaN(weddingDate.getTime())) {
            const dateStr = weddingDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
            bookedDates.add(dateStr);
            console.log('Added wedding date:', dateStr);
          }
        } catch (err) {
          console.error('Error processing weddingDate:', err);
        }
      }
      if (booking.prenuptDate) {
        try {
          const prenuptDate = new Date(booking.prenuptDate);
          if (!isNaN(prenuptDate.getTime())) {
            const dateStr = prenuptDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
            bookedDates.add(dateStr);
            console.log('Added prenupt date:', dateStr);
          }
        } catch (err) {
          console.error('Error processing prenuptDate:', err);
        }
      }
    });

    const datesArray = Array.from(bookedDates).sort();
    console.log(`Returning ${datesArray.length} booked dates:`, datesArray);

    res.json({ bookedDates: datesArray });
  } catch (error) {
    console.error('Get booked dates error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc   Send booking verification code
 * @method  POST
 * @access client
 */
export const sendBookingVerificationCode = async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Only clients can request booking verification' });
    }

    const { packageId, eventDate, title, venue, suppliers, externalSuppliers } = req.body;

    if (!packageId || !eventDate || !title || !venue) {
      return res.status(400).json({
        message: 'Missing required fields: packageId, eventDate, title, and venue are required',
      });
    }

    // Generate verification code
    const verificationCode = generateResetCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store verification data
    bookingVerificationStore.set(req.user._id.toString(), {
      code: verificationCode,
      expiresAt,
      bookingData: {
        packageId,
        eventDate,
        title: title.trim(),
        venue: venue.trim(),
        suppliers: Array.isArray(suppliers) ? suppliers : [],
        externalSuppliers: Array.isArray(externalSuppliers) ? externalSuppliers : [],
      },
    });

    // Send verification email
    const emailResult = await sendBookingVerificationEmail(
      req.user.email,
      req.user.fullName,
      verificationCode
    );

    if (!emailResult.success) {
      bookingVerificationStore.delete(req.user._id.toString());
      return res.status(500).json({ message: 'Failed to send verification email' });
    }

    res.json({
      message: 'Verification code sent to your email',
      expiresIn: 15, // minutes
    });
  } catch (error) {
    console.error('Send booking verification code error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc   Verify booking code and create booking
 * @method  POST
 * @access client
 */
export const verifyBookingCode = async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Only clients can verify booking codes' });
    }

    const { verificationCode } = req.body;

    if (!verificationCode) {
      return res.status(400).json({ message: 'Verification code is required' });
    }

    const userId = req.user._id.toString();
    const storedData = bookingVerificationStore.get(userId);

    if (!storedData) {
      return res
        .status(400)
        .json({ message: 'No verification code found. Please request a new one.' });
    }

    if (storedData.expiresAt < new Date()) {
      bookingVerificationStore.delete(userId);
      return res
        .status(400)
        .json({ message: 'Verification code has expired. Please request a new one.' });
    }

    if (storedData.code !== verificationCode.trim()) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Code is valid, proceed with booking creation
    const { packageId, eventDate, title, venue, suppliers, externalSuppliers } =
      storedData.bookingData;

    const pkg = await Package.findById(packageId);
    if (!pkg) {
      bookingVerificationStore.delete(userId);
      return res.status(404).json({ message: 'Package not found' });
    }

    // Check if date is at least 15 days in advance
    const eventDateObj = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + 15);

    if (eventDateObj < minDate) {
      bookingVerificationStore.delete(userId);
      return res.status(400).json({
        message: 'Bookings must be made at least 15 days in advance',
      });
    }

    // Check if date is already booked
    const startOfDay = new Date(eventDateObj);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(eventDateObj);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBooking = await Booking.findOne({
      weddingDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: 'accepted',
    });

    if (existingBooking) {
      bookingVerificationStore.delete(userId);
      return res.status(400).json({ message: 'This date is already booked' });
    }

    // Process external suppliers
    const rawExternalSelections = Array.isArray(externalSuppliers)
      ? externalSuppliers
          .map((category) => {
            const label = typeof category === 'string' ? category.trim() : '';
            const key = normalizeCategoryKey(label);
            if (!key) return null;
            return { key, label: label || key };
          })
          .filter(Boolean)
      : [];

    const uniqueExternalSelections = [];
    const seenExternalKeys = new Set();
    rawExternalSelections.forEach((selection) => {
      if (seenExternalKeys.has(selection.key)) return;
      seenExternalKeys.add(selection.key);
      uniqueExternalSelections.push(selection);
    });

    let externalSelectionEntries = [];
    if (uniqueExternalSelections.length > 0) {
      const docs = await ExternalSupplierDeduction.find({
        categoryKey: { $in: uniqueExternalSelections.map((sel) => sel.key) },
      }).lean();

      const docMap = docs.reduce((acc, doc) => {
        acc[doc.categoryKey] = doc;
        return acc;
      }, {});

      externalSelectionEntries = uniqueExternalSelections.map((selection) => {
        const matched = docMap[selection.key];
        return {
          category: selection.label || matched?.label || selection.key,
          deductionAmount: matched?.amount || 0,
        };
      });
    }

    const basePrice = Number(pkg.price) || 0;
    const totalDeduction = externalSelectionEntries.reduce(
      (sum, entry) => sum + (Number(entry.deductionAmount) || 0),
      0
    );
    const totalPrice = Math.max(0, basePrice - totalDeduction);

    // Create booking
    const booking = new Booking({
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email || '',
        phone: req.user.phone || '',
        address: req.user.address || '',
      },
      title,
      venue,
      package: pkg._id,
      weddingDate: eventDateObj,
      suppliers: Array.isArray(suppliers) ? suppliers : [],
      basePrice,
      totalPrice,
      payment: {
        status: 'pending',
        amount: totalPrice,
        currency: 'PHP',
      },
      externalSupplierSelections: externalSelectionEntries,
    });

    await booking.save();

    // Log activity
    await ActivityLog.create({
      actor: req.user._id,
      actorName: req.user.fullName,
      action: 'Create booking',
      details: `Booking ${booking._id}`,
    });

    // Clear verification code
    bookingVerificationStore.delete(userId);

    // Populate suppliers for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('suppliers', 'name category rating')
      .populate('package');

    res.status(201).json({
      message: 'Booking created successfully',
      booking: populatedBooking,
    });
  } catch (error) {
    console.error('Verify booking code error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Create a PayPal order for a booking
 * @route POST /api/bookings/:id/paypal/create-order
 * @access client
 */
export const createPaypalOrder = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, 'user.id': req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!(booking.status === 'pending')) {
      return res.status(400).json({ message: 'Can only create payment for pending bookings' });
    }
    if (booking.payment?.status === 'paid') {
      return res.status(400).json({ message: 'Booking is already paid' });
    }
    if (!booking.totalPrice || booking.totalPrice <= 0) {
      return res.status(400).json({ message: 'Booking has no payable amount' });
    }
    // create PayPal order and include booking._id as reference
    const resp = await paypalSdk.createOrder({ amount: booking.totalPrice, currency: booking.payment?.currency || 'PHP', description: `Payment for booking ${booking._id}`, reference_id: booking._id.toString() });
    // persist last create response for audit
    booking.payment = booking.payment || {};
    booking.payment.attempts = (booking.payment.attempts || 0) + 1;
    booking.payment.providerResponse = { createOrder: resp };
    await booking.save();
    const orderId = resp?.id;
    res.json({ orderId, links: resp?.links || resp });
  } catch (error) {
    console.error('createPaypalOrder error:', error);
    res.status(500).json({ message: 'Failed to create PayPal order', error: error?.message || error });
  }
};

/**
 * @desc Capture/approve PayPal order and update booking
 * @route POST /api/bookings/:id/paypal/capture
 * @access client
 */
export const capturePaypalOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: 'orderId is required' });
    const booking = await Booking.findOne({ _id: req.params.id, 'user.id': req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.payment?.status === 'paid') {
      return res.status(400).json({ message: 'Booking is already paid' });
    }
    const captureResp = await paypalSdk.captureOrder(orderId);
    // find capture detail entry
    const captureData = captureResp?.purchase_units?.[0]?.payments?.captures?.[0] || null;
    const payer = captureResp?.payer || {};
    if (!captureData) {
      // fallback, if not captured but status is 'COMPLETED' maybe
    }
    // Update booking payment information
    booking.payment = booking.payment || {};
    booking.payment.attempts = (booking.payment.attempts || 0) + 1;
    booking.payment.transactionId = captureData?.id || captureResp?.id || null;
    const capturedAmount = Number(captureData?.amount?.value || booking.totalPrice || 0);
    booking.payment.amount = capturedAmount;
    booking.payment.currency = captureData?.amount?.currency_code || booking.payment?.currency || 'PHP';
    booking.payment.paidAt = new Date();
    booking.payment.payer = {
      payerId: payer?.payer_id || payer?.payerID || payer?.id || null,
      email: payer?.email_address || null,
      name: `${payer?.name?.given_name || ''} ${payer?.name?.surname || ''}`.trim() || null,
    };
    booking.payment.method = 'paypal';
    booking.payment.providerResponse = { capture: captureResp };
    // Verify amount matches booking expected price (sanity check)
    if (!(Math.abs(capturedAmount - Number(booking.totalPrice || 0)) < 0.01)) {
      booking.payment.status = 'failed';
      console.warn('Captured amount does not match booking price', {
        bookingId: booking._id,
        expected: booking.totalPrice,
        captured: capturedAmount,
      });
    } else {
      booking.payment.status = (captureResp?.status === 'COMPLETED' || captureData?.status === 'COMPLETED') ? 'paid' : 'failed';
    }

    // If capture succeeded, keep booking status as 'pending' but mark payment as 'paid'
    if (booking.payment.status === 'paid') {
      // If payment completed, auto-accept the booking and notify customer (matching approveBooking flow)
      if (booking.status === 'pending') {
        booking.status = 'accepted';
        ensureBookingTitle(booking);
        // Send approval email
        try {
          if (booking.user?.id?.email) {
            const eventDate = booking.weddingDate
              ? new Date(booking.weddingDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : 'N/A';
            await sendBookingApprovalEmail(
              booking.user.id.email,
              booking.user.fullName || booking.user.id.fullName,
              booking._id.toString().slice(-8).toUpperCase(),
              eventDate
            );
          }
        } catch (e) {
          console.error('Failed to send approval email after payment', e);
        }
      }
      // Log activity
      await ActivityLog.create({
        actor: req.user._id,
        actorName: req.user.fullName,
        action: 'Pay booking',
        details: `Booking ${booking._id} paid via PayPal, txn ${booking.payment.transactionId}`,
      });
    }
    await booking.save();
    res.json({ booking, capture: captureResp });
  } catch (error) {
    console.error('capturePaypalOrder error:', error?.response?.data || error?.message || error);
    res.status(500).json({ message: 'Failed to capture PayPal order', error: error?.message || error });
  }
};

/**
 * @desc PayPal webhook handler for events like PAYMENT.CAPTURE.COMPLETED
 * @route POST /api/webhooks/paypal
 * @access public
 */
export const handlePaypalWebhook = async (req, res) => {
  try {
    const transmission_id = req.headers['paypal-transmission-id'] || req.headers['paypal-transmission-id'.toLowerCase()];
    const transmission_time = req.headers['paypal-transmission-time'];
    const cert_url = req.headers['paypal-cert-url'];
    const auth_algo = req.headers['paypal-auth-algo'];
    const transmission_sig = req.headers['paypal-transmission-sig'] || req.headers['paypal-transmission-sig'.toLowerCase()];
    const webhook_event = req.body;
    const verified = await paypalSdk.verifyWebhookSignature({ transmission_id, transmission_time, cert_url, auth_algo, transmission_sig, webhook_event, webhook_id: process.env.PAYPAL_WEBHOOK_ID });
    if (!verified) {
      console.warn('Webhook signature verification failed.');
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }
    // Handle relevant events
    const eventType = webhook_event?.event_type;
    if (eventType === 'PAYMENT.CAPTURE.COMPLETED' || eventType === 'CHECKOUT.ORDER.APPROVED' || eventType === 'PAYMENT.CAPTURE.REFUNDED') {
      const resource = webhook_event.resource || {};
      // Look up booking using reference_id if available
      const customId = resource?.custom_id || resource?.invoice_id || resource?.supplementary_data?.related_ids?.order_id || resource?.payment_instruction?.reference_id || resource?.id;
      // Try to extract invoice or reference from resource
      const transactionId = resource?.id || (resource?.payments?.captures?.[0]?.id) || resource?.resource?.id;
      // Try find using reference_id (store booking id in createOrder reference_id)
      let booking = null;
      if (resource?.invoice_id || resource?.custom_id || resource?.reference_id) {
        const possibleId = resource?.invoice_id || resource?.custom_id || resource?.reference_id;
        try { booking = await Booking.findById(possibleId); } catch (err) { /* ignore */ }
      }
      // fallback: find by transactionId
      if (!booking && transactionId) {
        booking = await Booking.findOne({ 'payment.transactionId': transactionId });
      }
      // If still not found, check nested capture id
      if (!booking && resource?.supplementary_data?.related_ids?.order_id) {
        const orderId = resource.supplementary_data.related_ids.order_id;
        booking = await Booking.findOne({ 'payment.providerResponse.createOrder.id': orderId });
      }
      if (!booking) {
        console.warn('Booking not found for webhook event', webhook_event);
        return res.status(200).json({ message: 'No related booking found' });
      }
      if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
        // Update booking payment
        booking.payment = booking.payment || {};
        booking.payment.status = 'paid';
        booking.payment.transactionId = transactionId;
        booking.payment.amount = Number(resource?.amount?.value || booking.totalPrice || 0);
        booking.payment.currency = resource?.amount?.currency_code || booking.payment.currency || 'PHP';
        booking.payment.paidAt = new Date(resource?.update_time || Date.now());
        booking.payment.payer = booking.payment.payer || {};
        // store provider response
        booking.payment.providerResponse = booking.payment.providerResponse || {};
        booking.payment.providerResponse.webhook = resource;
        await booking.save();
        // Log
        await ActivityLog.create({
          actor: null,
          actorName: 'PayPal Webhook',
          action: 'Webhook payment completed',
          details: `Booking ${booking._id} payment captured via webhook, txn ${transactionId}`,
        });
      } else if (eventType === 'PAYMENT.CAPTURE.REFUNDED') {
        booking.payment = booking.payment || {};
        booking.payment.status = 'refunded';
        booking.payment.providerResponse = booking.payment.providerResponse || {};
        booking.payment.providerResponse.webhook = resource;
        await booking.save();
        await ActivityLog.create({
          actor: null,
          actorName: 'PayPal Webhook',
          action: 'Webhook payment refunded',
          details: `Booking ${booking._id} payment refunded via webhook, txn ${transactionId}`,
        });
      }
    }
    return res.status(200).json({ message: 'Webhook received' });
  } catch (error) {
    console.error('handlePaypalWebhook error:', error);
    return res.status(500).json({ message: 'Webhook processing error', error: error?.message || error });
  }
};
