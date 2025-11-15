import { Schema, model } from 'mongoose';

const ReviewsSchema = new Schema(
  {
    // Custom numeric ID (like "1", "2", "3")
    id: {
      type: Number,
      required: true,
      unique: true,
    },

    // User name (string)
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Avatar URL (string)
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=150&h=150&fit=crop',
    },

    // Rating 1-5
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    // Review content
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Review = model('review', ReviewsSchema);

export default Review;
