import Review from '../models/review.model.js';

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
    const { name, avatar, rating, comment } = req.body;

    // Validate
    if (!name || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Name, rating, and comment are required',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    // Generate incremental numeric id
    const nextId = await generateNextId();

    // Create Review
    const review = await Review.create({
      id: nextId,
      name: name.trim(),
      avatar:
        avatar ||
        'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=150&h=150&fit=crop',
      rating,
      comment: comment.trim(),
    });

    res.status(201).json({
      success: true,
      data: {
        id: review.id,
        name: review.name,
        avatar: review.avatar,
        rating: review.rating,
        comment: review.comment,
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
      .limit(Number(limit));

    const total = await Review.countDocuments(query);

    const formatted = reviews.map((review) => ({
      id: review.id,
      name: review.name,
      avatar: review.avatar,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
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
