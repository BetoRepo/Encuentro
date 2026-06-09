import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

async function main() {
  const parentId = process.env.DRIVE_PARENT_FOLDER_ID;
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    console.error('OAuth credentials missing in .env');
    process.exit(1);
  }

  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oAuth2Client.setCredentials({ refresh_token: refreshToken });

  const drive = google.drive({ version: 'v3', auth: oAuth2Client });

  try {
    const res = await drive.files.list({
      q: `'${parentId}' in parents and trashed=false`,
      fields: 'files(id,name,mimeType)'
    });
    console.log('OK', (res.data.files || []).length, 'items');
    for (const f of res.data.files || []) {
      console.log('-', f.name, f.id, f.mimeType);
    }
  } catch (err) {
    console.error('ERROR', err.message || err);
    if (err.response && err.response.data) console.error('DETAILS', JSON.stringify(err.response.data));
    process.exit(2);
  }
}

main();
