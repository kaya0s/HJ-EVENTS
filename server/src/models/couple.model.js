import mongoose, { Schema, model } from 'mongoose';

const CoupleSchema = new Schema({
  coupleInfo: 
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  ,
}, {
  timestamps: true
});

const Couple = model('Couple', CoupleSchema);
export default Couple;
