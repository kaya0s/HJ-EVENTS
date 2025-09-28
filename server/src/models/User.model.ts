import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    phone: string;
    profilePic?: string;
    role: 'user' | 'admin';
    dateCreated: Date;
}

const UserSchema = new Schema<IUser>({
    firstName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 30,
    },
    lastName: {
        type: String,
        required: true,
        minlength: 3,   
        maxlength: 30,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 30,
    },
    email: {
        type: String,   
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    phone: {
        type: String,
        required: true,
        length: 11,
    },
    profilePic: {
        type: String,
        default: ""  
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.model<IUser>('User', UserSchema);
export default User;
