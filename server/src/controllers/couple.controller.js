import Couple from '../models/couple.model.js';
import User from '../models/user.model.js';

/**
 * @desc   Create a couple (link two clients)
 * @route  POST /api/couples
 * @access Admin / or Client (self-setup)
 */
export const createCouple = async (req, res) => {
  try {
    const { partner1Id, partner2Id, weddingDate, venue } = req.body;

    if (!partner1Id || !partner2Id) {
      return res.status(400).json({ message: 'Both partner IDs are required' });
    }

    if (partner1Id === partner2Id) {
      return res.status(400).json({ message: 'Partners cannot be the same user' });
    }

    // Check if both users exist and are clients
    const partner1 = await User.findById(partner1Id);
    const partner2 = await User.findById(partner2Id);

    if (!partner1 || !partner2) {
      return res.status(404).json({ message: 'One or both users not found' });
    }

    if (partner1.role !== 'client' || partner2.role !== 'client') {
      return res.status(400).json({ message: 'Both must be clients' });
    }

    // Check if already coupled
    const existing = await Couple.findOne({
      $or: [
        { partner1: partner1Id, partner2: partner2Id },
        { partner1: partner2Id, partner2: partner1Id },
      ],
    });

    if (existing) {
      return res.status(400).json({ message: 'These users are already a couple' });
    }

    // Create new couple
    const couple = await Couple.create({
      partner1: partner1Id,
      partner2: partner2Id,
      weddingDate,
      venue,
      status: 'Engaged',
    });

    res.status(201).json({
      message: 'Couple created successfully',
      couple,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc   Get all couples
 * @route  GET /api/couples
 * @access Admin
 */
export const getAllCouples = async (req, res) => {
  try {
    const couples = await Couple.find()
      .populate('partner1', 'name email')
      .populate('partner2', 'name email')
      .sort({ createdAt: -1 });
    res.json(couples);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc   Get one couple
 * @route  GET /api/couples/:id
 * @access Admin / Client
 */
export const getCoupleById = async (req, res) => {
  try {
    const couple = await Couple.findById(req.params.id)
      .populate('partner1', 'name email')
      .populate('partner2', 'name email');

    if (!couple) {
      return res.status(404).json({ message: 'Couple not found' });
    }

    res.json(couple);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc   Update couple details
 * @route  PUT /api/couples/:id
 * @access Admin / Client
 */
export const updateCouple = async (req, res) => {
  try {
    const updates = req.body;
    const couple = await Couple.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!couple) {
      return res.status(404).json({ message: 'Couple not found' });
    }

    res.json({ message: 'Couple updated', couple });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc   Delete couple
 * @route  DELETE /api/couples/:id
 * @access Admin
 */
export const deleteCouple = async (req, res) => {
  try {
    const couple = await Couple.findByIdAndDelete(req.params.id);

    if (!couple) {
      return res.status(404).json({ message: 'Couple not found' });
    }

    res.json({ message: 'Couple deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
