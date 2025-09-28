import mongoose, { Document, Schema } from 'mongoose';

export interface ISupplier extends Document {
    fullName: string;
    role: 'Caterer' | 'Decorator' | 'Photographer' | 'Musician' | 'Venue' | 'Other';
    dateCreated: Date;
}

const SupplierSchema = new Schema<ISupplier>({
    fullName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50,
    },
    role: {
        type: String,
        required: true,
        enum: ['Caterer', 'Decorator', 'Photographer', 'Musician', 'Venue', 'Other'],
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
});

const Supplier = mongoose.model<ISupplier>('Supplier', SupplierSchema);
export default Supplier;
