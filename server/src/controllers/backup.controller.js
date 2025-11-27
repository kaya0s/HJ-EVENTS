import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
// import { promisify } from 'util';
import archiver from 'archiver';
import dotenv from 'dotenv';

dotenv.config();

// const execAsync = promisify(exec);
const MONGODB_URI = process.env.MONGODB_URI;
const BACKUP_BASE_DIR = 'C:/backup_database';

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_BASE_DIR)) {
  fs.mkdirSync(BACKUP_BASE_DIR, { recursive: true });
}

// Helper function to get folder size
const getFolderSize = (folderPath) => {
  let totalSize = 0;
  try {
    const files = fs.readdirSync(folderPath);

    files.forEach((file) => {
      const filePath = path.join(folderPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        totalSize += getFolderSize(filePath);
      } else {
        totalSize += stats.size;
      }
    });
  } catch (error) {
    console.error('Error getting folder size:', error);
  }

  return totalSize;
};

// Get list of all backups
export const getBackups = async (req, res) => {
  try {
    if (!fs.existsSync(BACKUP_BASE_DIR)) {
      return res.status(200).json({ backups: [] });
    }

    const backupFolders = fs
      .readdirSync(BACKUP_BASE_DIR)
      .filter((file) => {
        const fullPath = path.join(BACKUP_BASE_DIR, file);
        return fs.statSync(fullPath).isDirectory() && file.startsWith('backup-');
      })
      .map((folder) => {
        const fullPath = path.join(BACKUP_BASE_DIR, folder);
        const stats = fs.statSync(fullPath);
        const size = getFolderSize(fullPath);

        // Get database name from folder structure
        const dbFolders = fs.readdirSync(fullPath);

        return {
          _id: folder,
          filename: folder,
          createdAt: stats.birthtime,
          size: size,
          collections: dbFolders,
          path: fullPath,
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({ backups: backupFolders });
  } catch (error) {
    console.error('Error getting backups:', error);
    res.status(500).json({ message: 'Failed to get backups', error: error.message });
  }
};

// Create new backup
export const createBackup = async (req, res) => {
  try {
    const timestamp = Date.now();
    const backupDir = path.join(BACKUP_BASE_DIR, `backup-${timestamp}`);

    const cmd = `mongodump --uri="${MONGODB_URI}" --out="${backupDir}"`;

    exec(cmd, { shell: true }, (err, stdout, stderr) => {
      if (err) {
        console.error('Backup STDERR:', stderr);
        return res.status(500).json({
          message: 'Backup failed',
          error: err.message,
          details: stderr,
        });
      }

      console.log('Backup STDOUT:', stdout);

      const size = getFolderSize(backupDir);

      res.status(200).json({
        message: 'Backup created successfully',
        backup: {
          _id: `backup-${timestamp}`,
          filename: `backup-${timestamp}`,
          location: backupDir,
          size: size,
          createdAt: new Date(),
        },
      });
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({
      message: 'Failed to create backup',
      error: error.message,
    });
  }
};

// Download backup as ZIP
export const downloadBackup = async (req, res) => {
  try {
    const { id } = req.params;
    const backupPath = path.join(BACKUP_BASE_DIR, id);

    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({ message: 'Backup not found' });
    }

    // Set headers for ZIP download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${id}.zip"`);

    // Create ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    });

    // Handle archive errors
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      res.status(500).json({ message: 'Error creating archive', error: err.message });
    });

    // Pipe archive to response
    archive.pipe(res);

    // Add the backup folder to the archive
    archive.directory(backupPath, false);

    // Finalize the archive
    await archive.finalize();
  } catch (error) {
    console.error('Error downloading backup:', error);
    if (!res.headersSent) {
      res.status(500).json({
        message: 'Failed to download backup',
        error: error.message,
      });
    }
  }
};

// Restore from backup
export const restoreBackup = async (req, res) => {
  try {
    const { backupId } = req.body;

    if (!backupId) {
      return res.status(400).json({ message: 'Backup ID is required' });
    }

    const backupPath = path.join(BACKUP_BASE_DIR, backupId);

    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({ message: 'Backup not found' });
    }

    // Get database name from URI
    const dbName = MONGODB_URI.split('/').pop().split('?')[0];
    const fullBackupPath = path.join(backupPath, dbName);

    if (!fs.existsSync(fullBackupPath)) {
      return res.status(404).json({
        message: 'Backup database folder not found',
        note: 'Make sure the backup contains the correct database',
        expectedPath: fullBackupPath,
      });
    }

    // Use mongorestore with --drop to replace existing data
    const cmd = `mongorestore --uri="${MONGODB_URI}" --drop "${fullBackupPath}"`;

    exec(cmd, { shell: true }, (err, stdout, stderr) => {
      if (err) {
        console.error('Restore STDERR:', stderr);
        return res.status(500).json({
          message: 'Restore failed',
          error: err.message,
          stderr: stderr,
        });
      }

      console.log('Restore STDOUT:', stdout);

      res.status(200).json({
        message: 'Database restored successfully',
        details: stdout,
      });
    });
  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({
      message: 'Failed to restore backup',
      error: error.message,
    });
  }
};

// Delete backup
export const deleteBackup = async (req, res) => {
  try {
    const { id } = req.params;
    const backupPath = path.join(BACKUP_BASE_DIR, id);

    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({ message: 'Backup not found' });
    }

    // Recursively delete the backup folder
    fs.rmSync(backupPath, { recursive: true, force: true });

    res.status(200).json({
      message: 'Backup deleted successfully',
      deletedBackup: id,
    });
  } catch (error) {
    console.error('Error deleting backup:', error);
    res.status(500).json({
      message: 'Failed to delete backup',
      error: error.message,
    });
  }
};

// Legacy function - keep for backward compatibility
export const backupDatabase = (req, res) => {
  const backupDir = path.join(BACKUP_BASE_DIR, `backup-${Date.now()}`);
  const cmd = `mongodump --uri="${MONGODB_URI}" --out="${backupDir}"`;

  exec(cmd, { shell: true }, (err, stdout, stderr) => {
    if (err) {
      console.error('STDERR:', stderr);
      return res.status(500).json({ message: 'Backup Failed', error: err.message });
    }
    console.log('STDOUT:', stdout);
    res.status(200).json({ message: 'Backup Successful', location: backupDir });
  });
};

export default backupDatabase;
