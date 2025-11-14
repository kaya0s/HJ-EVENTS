import { Schema, model } from 'mongoose';

const supplierSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Food', 'catering', 'Decoration', 'Photography', 'Videography', 'Music', 'Florist'],
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
    },
    priceRange: {
      type: String,
      default: '',
    },
    imageURL: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 0,
    },
    unavailableDates: {
      type: [Date],
      default: [],
    },
  },
  { timestamps: true }
);

const Supplier = model('Supplier', supplierSchema);
export default Supplier;
