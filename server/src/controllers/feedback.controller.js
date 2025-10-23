import Feedback from '../models/feedback.model.js';

/**
 * @route '/api/feedback'
 */

/**
 * @desc   Create new feedback
 * @method  POST
 * @access Public
 */
export const createFeedback = async (req, res) => {
  try {
    const { name, email, message, rating, supplierId, clientId } = req.body;

    const feedback = await Feedback.create({
      name,
      email,
      message,
      rating,
      supplier: supplierId || null,
      client: clientId || null,
    });

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create feedback', error: error.message });
  }
};

/**
 * @desc  Get all feedbacks
 * @method  GET
 * @access Public
 */
export const listFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('supplier', 'name')
      .populate('client', 'name email')
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to list feedbacks', error: error.message });
  }
};

/**
 * @desc   Get single feedback by ID
 * @method  GET
 * @access Public
 */
export const getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('supplier', 'name')
      .populate('client', 'name email');

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get feedback', error: error.message });
  }
};

/**
 * @desc   Update feedback
 * @method  PUT
 * @access Client
 */
export const updateFeedback = async (req, res) => {
  try {
    const updates = req.body;

    const feedback = await Feedback.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json({
      message: 'Feedback updated successfully',
      feedback,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update feedback', error: error.message });
  }
};

/**
 * @desc   Delete feedback
 * @method  DELETE
 * @access Client
 */
export const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete feedback', error: error.message });
  }
};
