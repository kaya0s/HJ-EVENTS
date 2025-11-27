import { exec } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI; // make sure DB name is in URI

const backupDatabase = (req, res) => {
  const backupDir = path.join('C:/backup_database', `backup-${Date.now()}`);

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
