const feedbackSchema = new Schema({
  couple: { 
    type: Schema.Types.ObjectId,
    ref: 'User', 
    required: true 
    },
  supplier: { type: Schema.Types.ObjectId, 
    ref: 'Supplier', 
    required: true 
    },
  booking: { 
    type: Schema.Types.ObjectId, 
    ref: 'Booking', 
    required: true 
    },
  rating: { 
    type: Number, 
    min: 1, 
    max: 5, 
    required: true 
    },
  comment: String,
  createdAt: {  
    type: Date, 
    default: Date.now 
    }
});

const Feedback = model('Feedback', feedbackSchema);
export default Feedback;
