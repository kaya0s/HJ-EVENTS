import { Schema, model } from 'mongoose';

const permissionSchema = new Schema(
  {
    role: {
      type: String,
      enum: ['user', 'supplier', 'admin'],
      required: true,
      index: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
    defaultValue: {
      type: Boolean,
      default: true,
    },
    value: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

permissionSchema.index({ role: 1, key: 1 }, { unique: true });

const Permission = model('permission', permissionSchema);

export default Permission;
