const bookingSchema = new Schema({
  couple: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
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
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = model('Booking', bookingSchema);
