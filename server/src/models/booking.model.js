import mongoose, { Schema, model } from 'mongoose';

const bookingSchema = new Schema({
  couple: { 
    type: Schema.Types.ObjectId,
    ref: 'user', 
    required: true 
  },
  package: { 
    type: Schema.Types.ObjectId, 
    ref: 'Package', 
    required: true 
  },
  eventDate: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected', 'Completed'], 
    default: 'Pending' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['Unpaid', 'Reserved', 'Paid'], 
    default: 'Unpaid' 
  },
  totalAmount: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

const Booking = model('Booking', bookingSchema);
export default Booking;
