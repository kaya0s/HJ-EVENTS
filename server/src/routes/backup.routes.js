import express from 'express';
import backupDatabase from '../controllers/backup.controller.js';

const router = express.Router();
router.get('/', backupDatabase);

export default router;
