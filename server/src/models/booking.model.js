import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', // Must match the model name in user.model.js
      },
      fullName: {
        type: String,
        required: true,
      },
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    venue: {
      type: String,
      required: true,
    },
    suppliers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
      },
    ],
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
    },
    prenuptDate: {
      type: Date,
      default: null,
    },
    weddingDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Completed', 'Cancelled', 'Rejected'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);
const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
