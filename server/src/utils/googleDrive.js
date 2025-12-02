import fs from 'fs';
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = './token.json';

// Load OAuth credentials
export const authorize = () => {
  const credentials = JSON.parse(fs.readFileSync('./credentials.json'));
  const { client_secret, client_id, redirect_uris } = credentials.installed;

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if token exists
  if (fs.existsSync(TOKEN_PATH)) {
    oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH)));
    return oAuth2Client;
  }

  // No token yet — first time authorization
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Authorize this app by visiting:', authUrl);

  throw new Error('🔑 No token found. Open the URL above and paste token into token.json.');
};

// Upload ZIP to Google Drive
export const uploadToDrive = async (auth, zipPath, zipName) => {
  const drive = google.drive({ version: 'v3', auth });

  const fileMetadata = {
    name: zipName,
  };

  const media = {
    mimeType: 'application/zip',
    body: fs.createReadStream(zipPath),
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id, name, webViewLink, webContentLink',
  });

  return response.data;
};
