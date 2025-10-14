import mongoose, { Schema, model } from 'mongoose';

const supplierSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
    },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  serviceType: {
    type: String,
    required: true,
    trim: true
  },
},{timestamps: true});

const Supplier = model('supplier', supplierSchema);
export default Supplier;
