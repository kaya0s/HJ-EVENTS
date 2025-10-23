import Booking from '../models/booking.model.js';
import Feedback from '../models/feedback.model.js';

// Return counts and popular suppliers
export const getDashboard = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const pending = await Booking.countDocuments({ status: 'Pending' });
    const approved = await Booking.countDocuments({ status: 'Approved' });

    // Popular suppliers by feedback count
    const popular = await Feedback.aggregate([
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
