import express from 'express';
import {
  getBackups,
  createBackup,
  downloadBackup,
  restoreBackup,
  deleteBackup,
  backupDatabase, // legacy
  testConnection,
  authorizeDrive,
  handleOAuthCallback,
  checkAuthStatus,
} from '../controllers/backup.controller.js';

const router = express.Router();

// Middleware to restrict backup routes for admin in production
const disallowInProduction = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Backup feature is disabled for admin in production.' });
  }
  next();
};

// OAuth2 authorization routes
router.get('/auth', disallowInProduction, authorizeDrive);
router.get('/auth/callback', disallowInProduction, handleOAuthCallback);
router.get('/auth/status', disallowInProduction, checkAuthStatus);

router.get('/test', disallowInProduction, testConnection);

router.get('/', disallowInProduction, getBackups);
router.post('/create', disallowInProduction, createBackup);
router.get('/download/:id', disallowInProduction, downloadBackup);
router.post('/restore', disallowInProduction, restoreBackup);
router.delete('/:id', disallowInProduction, deleteBackup);

router.post('/backup', disallowInProduction, backupDatabase);
export default router;
