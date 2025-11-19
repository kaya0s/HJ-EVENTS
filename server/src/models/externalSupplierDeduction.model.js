import { Schema, model } from 'mongoose';

const externalSupplierDeductionSchema = new Schema(
  {
    categoryKey: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const ExternalSupplierDeduction = model(
  'ExternalSupplierDeduction',
  externalSupplierDeductionSchema
);

export default ExternalSupplierDeduction;
