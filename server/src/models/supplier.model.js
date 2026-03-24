import { Schema, model } from 'mongoose';

const supplierSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: false,
      default: null,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    contactInfo: {
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      address: { type: String, default: '' },
      facebookPage: { type: String, default: '' },
    },
    priceRange: {
      type: String,
      default: '',
    },
    imageURL: {
      type: String,
      default: '',
    },
    unavailableDates: {
      type: [Date],
      default: [],
    },
  },
  { timestamps: true, optimisticConcurrency: true }
);

// Add sparse index on user field to allow multiple null values
supplierSchema.index({ user: 1 }, { unique: true, sparse: true });

// Add index on category field for faster queries
supplierSchema.index({ category: 1 });

const Supplier = model('Supplier', supplierSchema);
export default Supplier;
