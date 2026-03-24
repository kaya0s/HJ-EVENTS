import { body, validationResult } from 'express-validator';

// Validate category creation
export const validateCategoryCreate = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description must be at most 200 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Validate category update
export const validateCategoryUpdate = [
  body('oldName').trim().notEmpty().withMessage('Old category name is required'),
  body('newName')
    .trim()
    .notEmpty()
    .withMessage('New category name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Validate category deletion
export const validateCategoryDelete = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
