import Booking from '../models/booking.model.js';
import Package from '../models/package.model.js';
import ActivityLog from '../models/activityLog.model.js';

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
    const { packageId, eventDate } = req.body;
    if (!packageId || !eventDate) return res.status(400).json({ message: 'Missing fields' });

    const pkg = await Package.findById(packageId);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });

    const booking = new Booking({
      couple: req.user._id,
      package: pkg._id,
      eventDate: new Date(eventDate),
      totalAmount: pkg.price,
    });

    await booking.save();

    // Log activity
    await ActivityLog.create({
      actor: req.user._id,
      actorName: req.user.fullName,
      action: 'Create booking',
      details: `Booking ${booking._id}`,
    });

    res.status(201).json({ booking });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc   Get my Booking
 * @method  GET
 * @access Admin
 */
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ couple: req.user._id }).populate('package');
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: `Server error${error}` });
  }
};

/**
 * @desc   Create new feedback
 * @method  POST
 * @access Admin
 */
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, couple: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status === 'Approved')
      return res.status(400).json({ message: 'Cannot cancel an approved booking' });
    booking.status = 'Rejected';
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
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    booking.status = 'Approved';
    await booking.save();
    await ActivityLog.create({
      actor: req.user._id,
      actorName: req.user.fullName,
      action: 'Approve booking',
      details: `Booking ${booking._id}`,
    });
    res.json({ booking });
  } catch (error) {
    res.status(500).json({ message: `server error ${error}` });
  }
};
/**
 * @desc   Reject new feedback
 * @method  POST
 * @access Admin
 */

export const rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    booking.status = 'Rejected';
    await booking.save();
    await ActivityLog.create({
      actor: req.user._id,
      actorName: req.user.fullName,
      action: 'Reject booking',
      details: `Booking ${booking._id}`,
    });
    res.json({ booking });
  } catch (error) {
    res.status(500).json({ message: `server error ${error}` });
  }
};

/**
 * @desc    Mock Payment
 * @method  POST
 * @access Admin
 */
export const mockPayment = async (req, res) => {
  try {
    const { bookingId, mode } = req.body; // mode: 'reserve' or 'pay'
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    booking.paymentStatus = mode === 'pay' ? 'Paid' : 'Reserved';
    await booking.save();
    res.json({ booking });
  } catch (error) {
    res.status(500).json({ message: `server error ${error}` });
  }
};
