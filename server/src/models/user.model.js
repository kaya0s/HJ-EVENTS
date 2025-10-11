import mongoose, { Schema, model } from 'mongoose';

const userSchema = new Schema({
  fullName:{
    type:String,
    required:true,
    trim:true
  },
  password: {
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
  age: {
    type: Number,
    min: 0,
    default:0
  }
}, {
  timestamps: true
});

const User = mongoose.model('user',userSchema)
export default User
