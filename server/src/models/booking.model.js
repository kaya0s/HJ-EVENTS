import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
      fullName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        default: '',
      },
      phone: {
        type: String,
        default: '',
      },
      address: {
        type: String,
        default: '',
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
      enum: ['pending', 'accepted', 'completed', 'cancelled', 'rejected', 'expired'],
      default: 'pending',
    },
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'review',
      default: null,
    },
    basePrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    externalSupplierSelections: [
      {
        category: {
          type: String,
          required: true,
        },
        deductionAmount: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],
  },
  { timestamps: true }
);
const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
