import { Schema, model } from 'mongoose';

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    type: {
      type: String,
      enum: ['supplier', 'package', 'event'],
      default: 'supplier',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Compound index for efficient queries
categorySchema.index({ type: 1, isActive: 1 });

const Category = model('Category', categorySchema);
export default Category;
