import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { checkPermission } from '../middlewares/permissions.js';
import upload from '../middlewares/upload.js';
import {
  createSupplier,
  listSuppliers,
  getSupplier,
  updateSupplier,
  deleteSupplier,
  getMyProfile,
  updateMyProfile,
  getMyBookings,
  downloadMyBookingsReport,
  getSupplierCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  updateMyAvailability,
} from '../controllers/supplier.controller.js';
import {
  validateCategoryCreate,
  validateCategoryUpdate,
  validateCategoryDelete,
} from '../middlewares/validation.js';

const router = express.Router();

// Public routes
router.get('/', listSuppliers);

// Supplier access - enforce permissions
router.get('/my-profile', protect, authorize('supplier'), getMyProfile);
router.put(
  '/my-profile',
  protect,
  authorize('supplier'),
  checkPermission('supplier', 'manageProducts'),
  updateMyProfile
);
router.patch('/my-availability', protect, authorize('supplier'), updateMyAvailability);
router.get(
  '/my-bookings',
  protect,
  authorize('supplier'),
  checkPermission('supplier', 'viewBookings'),
  getMyBookings
);
router.get(
  '/reports/bookings/pdf',
  protect,
  authorize('supplier'),
  checkPermission('supplier', 'generateReports'),
  downloadMyBookingsReport
);

// Get all supplier categories
router.get('/categories', protect, authorize('admin'), getSupplierCategories);
router.post('/categories', protect, authorize('admin'), validateCategoryCreate, createCategory);
router.put('/categories', protect, authorize('admin'), validateCategoryUpdate, updateCategory);
router.delete('/categories', protect, authorize('admin'), validateCategoryDelete, deleteCategory);

// Admin access
router.post('/', protect, authorize('admin'), upload.single('image'), createSupplier);
router.put('/:id', protect, authorize('admin'), upload.single('image'), updateSupplier);
router.delete('/:id', protect, authorize('admin'), deleteSupplier);

// Public route for single supplier (keep last to avoid conflicts)
router.get('/:id', getSupplier);
export default router;
