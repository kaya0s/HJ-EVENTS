import Announcement from '../models/announcement.model.js';
import ActivityLog from '../models/activityLog.model.js';

export const postAnnouncement = async (req, res) => {
  try {
    const { title, message, isActive } = req.body;
    //save to announcement
    const a = await Announcement.create({ title, message, postedBy: req.user._id, isActive });
    //save activity log
    await ActivityLog.create({
      actor: req.user._id,
      actorName: req.user.fullName,
      action: 'Post announcement',
    });
    res.status(201).json({ announcement: a });
  } catch (error) {
    res.status(500).json({ message: `server error ${error.message}` });
  }
};

export const listAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ isActive: true }).sort(`-createdAt`);
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: `server error ${error.message}` });
  }
};

//get logs set limit 200
export const getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort('-createdAt').limit(200);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: `server error ${error.message}` });
  }
};
