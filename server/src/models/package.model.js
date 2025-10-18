const packageSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: String,
  price: { 
    type: Number, 
    required: true 
  },
  suppliers: [
    { 
    type: Schema.Types.ObjectId,
    ref: 'Supplier'
   }],
  createdAt: { 
    type: Date, 
    default: Date.now 
}
});

const Package = model('Package', packageSchema);
export default Package;
