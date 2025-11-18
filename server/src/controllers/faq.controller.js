import FAQ from '../models/faq.model.js';

export const getFaqs = async (_req, res) => {
  try {
    const faqs = await FAQ.find({ isPublished: true }).sort({ order: 1, createdAt: -1 });
    res.json({ faqs });
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createFaq = async (req, res) => {
  try {
    const { question, answer, order = 0, isPublished = true } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and answer are required' });
    }

    const faq = await FAQ.create({
      question: question.trim(),
      answer: answer.trim(),
      order,
      isPublished,
    });

    res.status(201).json({ faq });
  } catch (error) {
    console.error('Create FAQ error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, order, isPublished } = req.body;

    const faq = await FAQ.findById(id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    if (question !== undefined) faq.question = question.trim();
    if (answer !== undefined) faq.answer = answer.trim();
    if (order !== undefined) faq.order = order;
    if (typeof isPublished === 'boolean') faq.isPublished = isPublished;

    await faq.save();

    res.json({ faq });
  } catch (error) {
    console.error('Update FAQ error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await FAQ.findById(id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    await faq.deleteOne();
    res.json({ message: 'FAQ deleted' });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
