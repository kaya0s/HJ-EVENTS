import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = path.join(process.cwd(), 'drive-token.json');

/**
 * Create OAuth2 client for Google Drive
 */
export const getOAuth2Client = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_DRIVE_REDIRECT_URI || `${process.env.SERVER_URL}/api/backup/auth/callback`;

  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

/**
 * Get authorized OAuth2 client
 * Returns null if not authorized yet
 */
export const getAuthorizedClient = () => {
  const oAuth2Client = getOAuth2Client();

  // Check if token exists
  if (fs.existsSync(TOKEN_PATH)) {
    try {
      const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
      oAuth2Client.setCredentials(token);
      return oAuth2Client;
    } catch (error) {
      // Only show an error in exceptional situations (retain error log for troubleshooting)
      console.error('[DRIVE OAUTH] Error loading token:', error.message);
      return null;
    }
  }

  return null;
};

/**
 * Generate authorization URL
 */
export const getAuthUrl = () => {
  const oAuth2Client = getOAuth2Client();
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // Force consent to get refresh token
  });
};

/**
 * Save tokens after OAuth callback
 */
export const saveTokens = async (code) => {
  const oAuth2Client = getOAuth2Client();

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Save token to file
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));

    return tokens;
  } catch (error) {
    console.error('[DRIVE OAUTH] Error retrieving access token:', error);
    throw error;
  }
};

/**
 * Check if OAuth is authorized
 */
export const isAuthorized = () => {
  const client = getAuthorizedClient();
  if (!client) return false;

  const credentials = client.credentials;

  // Check if we have a refresh token (which doesn't expire)
  // OR a valid access token that hasn't expired
  if (credentials.refresh_token) return true;

  if (credentials.access_token && credentials.expiry_date) {
    return credentials.expiry_date > Date.now();
  }

  return false;
};
/**
 * Refresh access token if needed
 */
export const refreshTokenIfNeeded = async () => {
  const oAuth2Client = getAuthorizedClient();
  if (!oAuth2Client) {
    throw new Error('OAuth2 not authorized. Please authorize first.');
  }

  const credentials = oAuth2Client.credentials;

  // Check if token is expired or will expire soon
  if (credentials.expiry_date && credentials.expiry_date <= Date.now() + 60000) {
    try {
      const { credentials: newCredentials } = await oAuth2Client.refreshAccessToken();
      oAuth2Client.setCredentials(newCredentials);

      // Save refreshed token
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(newCredentials, null, 2));
    } catch (error) {
      console.error('[DRIVE OAUTH] Error refreshing token:', error);
      throw new Error('Failed to refresh token. Please re-authorize.');
    }
  }

  return oAuth2Client;
};
