import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import unzipper from 'unzipper';
import { promisify } from 'util';
import { getAuthUrl, saveTokens, isAuthorized, refreshTokenIfNeeded } from '../utils/driveOAuth.js';

const execAsync = promisify(exec);
dotenv.config();

const BACKUP_BASE_DIR = 'C:\\backup_database';
const MONGODB_URI = process.env.MONGODB_URI;
const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();

// ===========================
// OAUTH2 GOOGLE DRIVE CLIENT
// ===========================
const getDriveClient = async () => {
  try {
    if (!isAuthorized()) {
      const authUrl = getAuthUrl();
      throw new Error(
        `OAuth2 not authorized. Please visit: ${authUrl}\n` +
          `Or use the /api/backup/auth endpoint to authorize.`
      );
    }
    const auth = await refreshTokenIfNeeded();
    return google.drive({ version: 'v3', auth });
  } catch (error) {
    console.error('[GOOGLE ERROR] Failed to create Drive client:', error.message);
    if (error.response) {
      console.error('[GOOGLE ERROR] Response status:', error.response.status);
      console.error('[GOOGLE ERROR] Response data:', JSON.stringify(error.response.data, null, 2));
    }
    if (error.errors) {
      console.error('[GOOGLE ERROR] Error details:', JSON.stringify(error.errors, null, 2));
    }
    throw error;
  }
};

// ===========================
// TEST FUNCTION
// ===========================
export const testConnection = async (req, res) => {
  try {
    // Test MongoDB connection
    const testMongoCmd = `mongosh "${MONGODB_URI}" --eval "db.adminCommand('ping')"`;

    try {
      await execAsync(testMongoCmd, { shell: true });
    } catch (mongoError) {
      return res.status(500).json({
        message: 'MongoDB connection failed',
        error: mongoError.message,
      });
    }

    // Test Google Drive connection
    try {
      const drive = await getDriveClient();

      const folderInfo = await drive.files.get({
        fileId: GOOGLE_DRIVE_FOLDER_ID,
        fields: 'id, name, mimeType',
        supportsAllDrives: true,
      });

      const files = await drive.files.list({
        q: `'${GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed=false`,
        pageSize: 5,
        fields: 'files(id, name)',
        supportsAllDrives: true,
      });

      return res.status(200).json({
        message: 'All connections successful',
        mongo: 'OK',
        googleDrive: 'OK',
        folderName: folderInfo.data.name,
        fileCount: files.data.files.length,
      });
    } catch (googleError) {
      return res.status(500).json({
        message: 'Google Drive connection failed',
        error: googleError.message,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Test failed',
      error: error.message,
    });
  }
};

// ===========================
// GET BACKUPS (Improved) - now also returns the dates for each backup
// ===========================
export const getBackups = async (req, res) => {
  try {
    if (!isAuthorized()) {
      const authUrl = getAuthUrl();
      return res.status(401).json({
        success: false,
        message: 'OAuth2 not authorized',
        error: 'Please authorize Google Drive access first',
        authUrl,
        instructions: [
          '1. Visit the authUrl above in your browser',
          '2. Sign in with your Google account',
          '3. Grant permissions to access Google Drive',
          '4. You will be redirected back automatically',
          `Or visit: ${req.protocol}://${req.get('host')}/api/backup/auth`,
        ],
      });
    }

    const drive = await getDriveClient();

    const result = await drive.files.list({
      q: `'${GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id, name, createdTime, modifiedTime, size, mimeType)',
      orderBy: 'createdTime desc',
      supportsAllDrives: true,
    });

    const backups = result.data.files
      .filter((file) => file.name.endsWith('.zip') || file.mimeType === 'application/zip')
      .map((file) => ({
        id: file.id,
        name: file.name,
        size: file.size,
        mimeType: file.mimeType,
        createdTime: file.createdTime,
        modifiedTime: file.modifiedTime,
        date: file.createdTime ? new Date(file.createdTime).toLocaleString() : undefined,
      }));

    return res.status(200).json({
      success: true,
      backups,
      count: backups.length,
    });
  } catch (error) {
    console.error('[ERROR] Failed to get backups:', error.message);
    if (error.response) {
      console.error('[ERROR] Response data:', error.response.data);
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to get backups',
      error: error.message,
    });
  }
};

// ===========================
// CREATE BACKUP
// ===========================
export const createBackup = async (req, res) => {
  try {
    if (!isAuthorized()) {
      const authUrl = getAuthUrl();
      return res.status(401).json({
        success: false,
        message: 'OAuth2 not authorized',
        error: 'Please authorize Google Drive access first',
        authUrl,
        instructions: [
          '1. Visit the authUrl above in your browser',
          '2. Sign in with your Google account',
          '3. Grant permissions to access Google Drive',
          '4. You will be redirected back automatically',
          `Or visit: ${req.protocol}://${req.get('host')}/api/backup/auth`,
        ],
      });
    }

    const drive = await getDriveClient();

    // Verify folder access before proceeding
    try {
      await drive.files.get({
        fileId: GOOGLE_DRIVE_FOLDER_ID,
        fields: 'id, name, mimeType, owners, driveId',
        supportsAllDrives: true,
      });
    } catch (folderError) {
      return res.status(500).json({
        message: 'Cannot access Google Drive folder',
        error: folderError.message,
        details:
          'Please ensure the folder exists and is accessible by the authenticated Google account.',
        solution:
          'The folder must be owned by or shared with the Google account used for OAuth2 authentication.',
      });
    }

    const timestamp = Date.now();
    const backupName = `backup-${timestamp}`;
    const backupDir = path.join(BACKUP_BASE_DIR, backupName);
    const zipPath = path.join(BACKUP_BASE_DIR, `${backupName}.zip`);

    const cmd = `mongodump --uri="${MONGODB_URI}" --out="${backupDir}"`;

    exec(cmd, { shell: true }, async (err, stdout, stderr) => {
      if (err) {
        return res.status(500).json({ message: 'Backup failed', error: stderr });
      }

      await new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.pipe(output);
        archive.directory(backupDir, false);

        output.on('close', resolve);

        archive.on('error', (e) => {
          reject(e);
        });

        archive.finalize();
      });

      try {
        const driveUpload = await drive.files.create({
          requestBody: {
            name: `${backupName}.zip`,
            parents: [GOOGLE_DRIVE_FOLDER_ID],
          },
          media: {
            mimeType: 'application/zip',
            body: fs.createReadStream(zipPath),
          },
          fields: 'id, name, createdTime, size',
          supportsAllDrives: true,
        });

        fs.rmSync(backupDir, { recursive: true, force: true });
        fs.unlinkSync(zipPath);

        res.status(200).json({
          message: 'Backup created & uploaded',
          file: driveUpload.data,
        });
      } catch (uploadError) {
        if (fs.existsSync(backupDir)) fs.rmSync(backupDir, { recursive: true, force: true });
        if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

        const errorReason = uploadError.response?.data?.error?.errors?.[0]?.reason;
        const errorMessage = uploadError.response?.data?.error?.message || uploadError.message;

        let solution = '';
        if (errorReason === 'storageQuotaExceeded' || errorMessage.includes('storage quota')) {
          solution =
            '❌ Storage quota exceeded.\n\n' +
            '📋 SOLUTIONS:\n\n' +
            '1. Check your Google Drive storage quota\n' +
            '2. Free up space in your Google Drive\n' +
            '3. Delete old backups if needed\n' +
            '4. Consider upgrading your Google storage plan';
        }

        return res.status(500).json({
          message: 'Failed to upload backup to Google Drive',
          error: errorMessage,
          details: uploadError.response?.data || 'Unknown error',
          solution:
            solution ||
            'Please check folder permissions and ensure the folder is shared with the service account.',
        });
      }
    });
  } catch (error) {
    console.error('[ERROR] Backup creation failed:', error);
    res.status(500).json({ message: 'Failed to create backup', error: error.message });
  }
};

// ===========================
// DOWNLOAD BACKUP
// ===========================
export const downloadBackup = async (req, res) => {
  try {
    const { id } = req.params;

    const drive = await getDriveClient();

    const meta = await drive.files.get({
      fileId: id,
      fields: 'id, name',
      supportsAllDrives: true,
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${meta.data.name}"`);

    const stream = await drive.files.get(
      { fileId: id, alt: 'media', supportsAllDrives: true },
      { responseType: 'stream' }
    );

    stream.data.pipe(res);
  } catch (error) {
    console.error('[ERROR] Download failed:', error);
    res.status(500).json({ message: 'Failed to download', error: error.message });
  }
};

// ===========================
// RESTORE BACKUP
// ===========================
export const restoreBackup = async (req, res) => {
  try {
    const { backupId } = req.body;

    if (!backupId) {
      return res.status(400).json({ message: 'Backup ID required' });
    }

    const drive = await getDriveClient();
    const ts = Date.now();

    const zipPath = path.join(BACKUP_BASE_DIR, `restore-${ts}.zip`);
    const extractDir = path.join(BACKUP_BASE_DIR, `restore-${ts}`);

    await new Promise((resolve, reject) => {
      const dest = fs.createWriteStream(zipPath);
      drive.files
        .get(
          { fileId: backupId, alt: 'media', supportsAllDrives: true },
          { responseType: 'stream' }
        )
        .then((res2) => {
          res2.data.pipe(dest);
          dest.on('finish', resolve);
          dest.on('error', reject);
        });
    });

    await new Promise((resolve, reject) => {
      fs.createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: extractDir }))
        .on('close', resolve)
        .on('error', reject);
    });

    fs.unlinkSync(zipPath);

    const cleanUri = MONGODB_URI.replace(/\/$/, '');
    const dbName = cleanUri.split('/').pop().split('?')[0];
    const fullBackupPath = path.join(extractDir, dbName);

    if (!fs.existsSync(fullBackupPath)) {
      fs.rmSync(extractDir, { recursive: true, force: true });
      return res.status(404).json({
        message: 'Database folder not found in backup',
      });
    }

    const cmd = `mongorestore --uri="${MONGODB_URI}" --drop "${fullBackupPath}"`;

    exec(cmd, { shell: true }, (err, stdout, stderr) => {
      fs.rmSync(extractDir, { recursive: true, force: true });

      if (err) {
        return res.status(500).json({ message: 'Restore failed', error: stderr });
      }

      res.status(200).json({ message: 'Database restored', details: stdout });
    });
  } catch (error) {
    console.error('[ERROR] Restore error:', error);
    res.status(500).json({ message: 'Restore error', error: error.message });
  }
};

// ===========================
// DELETE BACKUP
// ===========================
export const deleteBackup = async (req, res) => {
  try {
    const { id } = req.params;

    const drive = await getDriveClient();

    await drive.files.update({
      fileId: id,
      requestBody: { trashed: true },
      supportsAllDrives: true,
    });

    res.status(200).json({ message: 'Backup deleted', id });
  } catch (error) {
    console.error('[ERROR] Delete failed:', error);
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
};

// Legacy
export const backupDatabase = (req, res) => {
  res.status(501).json({ message: 'Use /backup/create instead.' });
};

export const testGoogleAuth = async () => {
  try {
    const drive = await getDriveClient();

    const result = await drive.files.list({
      q: `'${GOOGLE_DRIVE_FOLDER_ID}' in parents`,
      pageSize: 1,
      fields: 'files(id, name)',
      supportsAllDrives: true,
    });

    return true;
  } catch (error) {
    console.error('[GOOGLE AUTH TEST] Failed:', error.message);
    console.error('[GOOGLE AUTH TEST] Full error:', error);
    return false;
  }
};

// ===========================
// OAUTH2 AUTHORIZATION
// ===========================
export const authorizeDrive = (req, res) => {
  try {
    if (isAuthorized()) {
      return res.status(200).json({
        message: 'Already authorized',
        authorized: true,
        status: 'ready',
      });
    }

    const authUrl = getAuthUrl();
    res.status(200).json({
      message: 'Visit this URL to authorize Google Drive access',
      authUrl,
      authorized: false,
      status: 'needs_authorization',
      instructions: [
        '1. Click on the authUrl above or copy it to your browser',
        '2. Sign in with the Google account that owns your backup folder',
        '3. Click "Allow" to grant permissions',
        '4. You will be redirected back automatically',
        '5. After authorization, you can use all backup features',
      ],
    });
  } catch (error) {
    console.error('[OAUTH ERROR]', error);
    res.status(500).json({
      message: 'Failed to generate auth URL',
      error: error.message,
      details: 'Make sure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in .env',
    });
  }
};

export const handleOAuthCallback = async (req, res) => {
  try {
    const { code, error: oauthError } = req.query;

    if (oauthError) {
      console.error('[OAUTH CALLBACK ERROR]', oauthError);
      const errorHtml = `
        <html>
          <body style="font-family: Arial; padding: 20px; text-align: center;">
            <h1 style="color: red;">Authorization Failed</h1>
            <p>Error: ${oauthError}</p>
            <p><a href="/api/backup/auth">Try again</a></p>
          </body>
        </html>
      `;
      return res.status(400).send(errorHtml);
    }

    if (!code) {
      const noCodeHtml = `
        <html>
          <body style="font-family: Arial; padding: 20px; text-align: center;">
            <h1 style="color: red;">Authorization Code Missing</h1>
            <p>No authorization code was provided.</p>
            <p><a href="/api/backup/auth">Try again</a></p>
          </body>
        </html>
      `;
      return res.status(400).send(noCodeHtml);
    }

    await saveTokens(code);

    const successHtml = `
      <html>
        <body style="font-family: Arial; padding: 20px; text-align: center;">
          <h1 style="color: green;">✅ Successfully Authorized!</h1>
          <p>Google Drive access has been authorized. You can now use the backup functionality.</p>
          <p><a href="/api/backup/auth/status">Check status</a> | <a href="/api/backup">View backups</a></p>
        </body>
      </html>
    `;
    res.status(200).send(successHtml);
  } catch (error) {
    console.error('[OAUTH CALLBACK ERROR]', error);
    const errorHtml = `
      <html>
        <body style="font-family: Arial; padding: 20px; text-align: center;">
          <h1 style="color: red;">Authorization Error</h1>
          <p>${error.message}</p>
          <p><a href="/api/backup/auth">Try again</a></p>
        </body>
      </html>
    `;
    res.status(500).send(errorHtml);
  }
};

export const checkAuthStatus = (req, res) => {
  try {
    const authorized = isAuthorized();
    res.status(200).json({
      authorized,
      message: authorized
        ? 'OAuth2 is authorized and ready to use'
        : 'OAuth2 not authorized. Please authorize first.',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to check auth status',
      error: error.message,
    });
  }
};

export default backupDatabase;
