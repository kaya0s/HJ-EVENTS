import mongoose, { Schema, model } from 'mongoose';

const BookingSchema = new Schema({
  couple: {
    type: Schema.Types.ObjectId,
    ref: 'Couple',
    required: true,
    index: true
  },
  eventType: {
    type: String,
    enum: ['wedding', 'prenup'],
    default: 'wedding'
  },
  eventDate: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

// helpful compound index for queries by couple + date
BookingSchema.index({ couple: 1, eventDate: 1 });

const Booking = model('Booking', BookingSchema);
export default Booking;
