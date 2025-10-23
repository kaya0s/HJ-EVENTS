import { Schema, model } from 'mongoose';

const CoupleSchema = new Schema(
  {
    partner1: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    partner2: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    weddingDate: {
      type: Date,
    },
    venue: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Engaged', 'Married', 'Pending', 'Cancelled'],
      default: 'Pending',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

//prevent duplicate couple pairing
CoupleSchema.index({ partner1: 1, partner2: 1 }, { unique: true });

const Couple = model('Couple', CoupleSchema);
export default Couple;
