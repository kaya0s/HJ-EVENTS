import express from 'express';
import {
  getBackups,
  createBackup,
  downloadBackup,
  restoreBackup,
  deleteBackup,
  backupDatabase, // legacy
} from '../controllers/backup.controller.js';

const router = express.Router();

router.get('/', getBackups);
router.post('/create', createBackup);
router.get('/download/:id', downloadBackup);
router.post('/restore', restoreBackup);
router.delete('/:id', deleteBackup);

router.post('/backup', backupDatabase);
export default router;
