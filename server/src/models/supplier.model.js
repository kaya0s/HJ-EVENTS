const supplierSchema = new Schema({
  name: { 
    type: String, 
    required: true
   },
  category: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  contactInfo: {
    phone: String,
    email: String,
    address: String
  },
  rating: { 
    type: Number, 
    default: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Supplier = model('Supplier', supplierSchema);
export default Supplier;
