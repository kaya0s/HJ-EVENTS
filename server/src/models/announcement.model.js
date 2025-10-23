import { model, Schema } from 'mongoose';

const announcementSchema = new Schema(
  {
    title: {
      type: String,
      require: true,
    },
    message: {
      type: String,
      required: true,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Announcement = model('Announcement', announcementSchema);
export default Announcement;
