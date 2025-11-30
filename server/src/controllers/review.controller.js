import Review from '../models/review.model.js';
import Booking from '../models/booking.model.js';
import { unconditionalUpdate } from '../utils/concurrency.js';

// Generate incremental ID (if needed)
async function generateNextId() {
  const last = await Review.findOne().sort({ id: -1 });
  return last ? last.id + 1 : 1;
}

// ===============================
// CREATE REVIEW
// ===============================
export const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Booking, rating, and comment are required',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      'user.id': req.user._id,
    }).populate('package');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed bookings can be reviewed',
      });
    }

    if (booking.review) {
      return res.status(400).json({
        success: false,
        message: 'This booking already has a review',
      });
    }

    const existing = await Review.findOne({ booking: bookingId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This booking already has a review',
      });
    }

    const nextId = await generateNextId();
    // No timestamp concurrency required for reviews. Proceed to create the review and attach it to the booking.
    const review = await Review.create({
      id: nextId,
      name: req.user.fullName,
      avatar:
        req.user.profilePic ||
        'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=150&h=150&fit=crop',
      rating,
      comment: comment.trim(),
      booking: booking._id,
      user: req.user._id,
    });

    // Re-check if booking already has a review (narrow race window) and avoid duplicate reviews
    const freshBooking = await Booking.findById(booking._id).lean();
    if (freshBooking && freshBooking.review) {
      // Roll back created review
      await Review.deleteOne({ _id: review._id }).catch(() => {});
      return res.status(409).json({ success: false, message: 'This booking already has a review', booking: freshBooking });
    }

    // Attach the review to the booking unconditionally - avoid timestamp concurrency.
    await unconditionalUpdate(Booking, { _id: booking._id }, { review: review._id });

    res.status(201).json({
      success: true,
      data: {
        reviewId: review._id,
        bookingId: booking._id,
        rating: review.rating,
        comment: review.comment,
        name: review.name,
        createdAt: review.createdAt,
      },
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message,
    });
  }
};

// ===============================
// GET ALL REVIEWS
// ===============================
export const getAllReviews = async (req, res) => {
  try {
    const { limit = 10, page = 1, rating } = req.query;

    const query = {};
    if (rating) query.rating = parseInt(rating);

    const skip = (page - 1) * limit;

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .populate('booking', 'title weddingDate status');

    const total = await Review.countDocuments(query);

    const formatted = reviews.map((review) => ({
      id: review.id,
      name: review.name,
      avatar: review.avatar,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      booking: review.booking
        ? {
            id: review.booking._id,
            title: review.booking.title,
            status: review.booking.status,
            weddingDate: review.booking.weddingDate,
          }
        : null,
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: formatted,
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message,
    });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized to edit this review' });
    }

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5',
        });
      }
      review.rating = rating;
    }

    if (comment !== undefined) {
      review.comment = comment.trim();
    }

    await review.save();

    res.json({
      success: true,
      data: {
        reviewId: review._id,
        bookingId: review.booking,
        rating: review.rating,
        comment: review.comment,
        name: review.name,
        createdAt: review.createdAt,
      },
    });
  } catch (error) {
    console.error('Update review error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error updating review', error: error.message });
  }
};

// ===============================
// REVIEW STATISTICS
// ===============================
export const getReviewStats = async (req, res) => {
  try {
    const stats = await Review.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          fiveStars: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          fourStars: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          threeStars: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          twoStars: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        averageRating: 0,
        totalReviews: 0,
        fiveStars: 0,
        fourStars: 0,
        threeStars: 0,
        twoStars: 0,
        oneStar: 0,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message,
    });
  }
};
