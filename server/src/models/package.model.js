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
    suppliers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Supplier',
      },
    ],
  },
  { timestamps: true }
);

const Package = model('Package', packageSchema);
export default Package;
