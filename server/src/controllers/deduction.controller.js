import ExternalSupplierDeduction from '../models/externalSupplierDeduction.model.js';

const normalizeCategory = (value = '') => value.trim().toLowerCase();

export const getDeductions = async (_req, res) => {
  try {
    const docs = await ExternalSupplierDeduction.find({}).sort('label').lean();
    res.json({
      deductions: docs.map((doc) => ({
        categoryKey: doc.categoryKey,
        label: doc.label,
        amount: doc.amount,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch deduction settings:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const upsertDeductions = async (req, res) => {
  try {
    const { deductions } = req.body;
    if (!Array.isArray(deductions)) {
      return res.status(400).json({ message: 'Invalid payload. Expected deductions array.' });
    }

    const bulkOps = deductions
      .map((entry = {}) => {
        const label = typeof entry.label === 'string' ? entry.label.trim() : '';
        const category = typeof entry.category === 'string' ? entry.category.trim() : label;
        const amount = Number(entry.amount);
        const normalizedKey = normalizeCategory(category);

        if (!normalizedKey) return null;

        return {
          updateOne: {
            filter: { categoryKey: normalizedKey },
            update: {
              categoryKey: normalizedKey,
              label: label || category,
              amount: Number.isFinite(amount) && amount > 0 ? amount : 0,
              updatedBy: req.user?._id || null,
            },
            upsert: true,
          },
        };
      })
      .filter(Boolean);

    if (bulkOps.length === 0) {
      return res.status(400).json({ message: 'No valid deduction entries were provided.' });
    }

    await ExternalSupplierDeduction.bulkWrite(bulkOps);

    const docs = await ExternalSupplierDeduction.find({}).sort('label').lean();
    res.json({
      deductions: docs.map((doc) => ({
        categoryKey: doc.categoryKey,
        label: doc.label,
        amount: doc.amount,
      })),
    });
  } catch (error) {
    console.error('Failed to upsert deductions:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const normalizeCategoryKey = normalizeCategory;
