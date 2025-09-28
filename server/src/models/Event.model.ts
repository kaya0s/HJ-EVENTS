import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IEvent extends Document {
    title: string;
    description: string;
    date: Date;
    location: string;
    createdBy: Types.ObjectId;
    attendees: Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}

const EventSchema = new Schema<IEvent>({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    attendees: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
}, { timestamps: true });

const Event = mongoose.model<IEvent>('Event', EventSchema);
export default Event;
