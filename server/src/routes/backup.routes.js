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

// OAuth2 authorization routes
router.get('/auth', authorizeDrive);
router.get('/auth/callback', handleOAuthCallback);
router.get('/auth/status', checkAuthStatus);

router.get('/test', testConnection);

router.get('/', getBackups);
router.post('/create', createBackup);
router.get('/download/:id', downloadBackup);
router.post('/restore', restoreBackup);
router.delete('/:id', deleteBackup);

router.post('/backup', backupDatabase);
export default router;
