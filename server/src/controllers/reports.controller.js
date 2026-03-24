import Booking from '../models/booking.model.js';
import Review from '../models/review.model.js';
import { createPdfId, streamBookingsPdf } from '../utils/pdfReports.js';

export const getDateRangeStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const [bookings, monthlyData] = await Promise.all([
      Booking.find({
        createdAt: { $gte: start, $lte: end },
      }).populate('package', 'name price'),
      Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            totalSales: {
              $sum: { $cond: [{ $in: ['$status', ['accepted', 'completed']] }, '$totalPrice', 0] },
            },
            bookingCount: { $count: {} },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    const stats = {
      totalSales: bookings
        .filter((b) => ['accepted', 'completed'].includes(b.status))
        .reduce((sum, b) => sum + b.totalPrice, 0),
      bookingCount: bookings.length,
      averageValue:
        bookings.length > 0
          ? (bookings.reduce((sum, b) => sum + b.totalPrice, 0) / bookings.length).toFixed(2)
          : 0,
      topPackage: bookings.reduce((acc, b) => {
        if (b.package?.name) {
          acc[b.package.name] = (acc[b.package.name] || 0) + 1;
        }
        return acc;
      }, {}),
    };

    res.json({ stats, monthlyData });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error}` });
  }
};

// Return counts and popular suppliers
export const getDashboard = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const pending = await Booking.countDocuments({ status: 'Pending' });
    const approved = await Booking.countDocuments({ status: 'Approved' });

    // Popular suppliers by Review count
    const popular = await Review.aggregate([
      { $group: { _id: '$supplier', count: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'suppliers', localField: '_id', foreignField: '_id', as: 'supplier' } },
      { $unwind: '$supplier' },
    ]);

    res.json({ totalBookings, pending, approved, popular });
  } catch (error) {
    res.status(500).json({ message: `Server error${error}` });
  }
};

export const getMonthlyRevenue = async (req, res) => {
  try {
    const months = await Booking.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: { $month: '$createdAt' }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { _id: 1 } },
    ]);
    res.json({ months });
  } catch (error) {
    res.status(500).json({ message: `Server error${error}` });
  }
};

export const downloadBookingsReport = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
    const bookings = await Booking.find()
      .sort({ weddingDate: -1 })
      .limit(limit)
      .populate('user.id', 'fullName email')
      .populate('package', 'name')
      .lean();

    const reportId = createPdfId();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="booking-report-${reportId}.pdf"`);
    res.setHeader('X-Report-Id', reportId);

    streamBookingsPdf({
      bookings,
      res,
      title: 'Company Booking Report',
      subtitle: 'Administrative View',
      generatedBy: req.user?.fullName || 'Administrative User',
      pdfId: reportId,
    });
  } catch (error) {
    console.error('Download bookings report error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to generate booking report' });
    }
  }
};
