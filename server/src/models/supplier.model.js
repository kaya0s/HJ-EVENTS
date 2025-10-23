import { Schema, model } from 'mongoose';

const supplierSchema = new Schema(
  {
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
  },
  { timestamps: true }
);

const Supplier = model('Supplier', supplierSchema);
export default Supplier;
