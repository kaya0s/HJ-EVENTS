import { Schema, model } from 'mongoose';

const feedbackSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      require: true,
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'booking',
      require: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Feedback = model('Feedback', feedbackSchema);

export default Feedback;
