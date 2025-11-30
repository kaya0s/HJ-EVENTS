import { Schema, model } from 'mongoose';

const packageSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
    },
    imageURL: {
      type: String,
      default: '',
    },
    suppliers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Supplier',
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, optimisticConcurrency: true }
);

const Package = model('Package', packageSchema);
export default Package;
