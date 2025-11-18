import Booking from '../models/booking.model.js';
import Package from '../models/package.model.js';
import ActivityLog from '../models/activityLog.model.js';
import ExternalSupplierDeduction from '../models/externalSupplierDeduction.model.js';
import { sendBookingApprovalEmail, sendBookingRejectionEmail } from '../utils/email.js';

const normalizeCategoryKey = (value = '') => value.trim().toLowerCase();

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
    const { title, venue } = req.body;
    const booking = await Booking.findOne({ _id: req.params.id, 'user.id': req.user._id })
      .populate('package')
      .populate('suppliers', 'name category rating');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Cannot edit accepted bookings
    if (booking.status === 'accepted') {
      return res.status(400).json({ message: 'Cannot edit an accepted booking' });
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
