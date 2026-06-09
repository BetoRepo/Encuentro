import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT = process.env.PORT || 3000;
const PARENT_FOLDER_ID = process.env.DRIVE_PARENT_FOLDER_ID || '1FeRqD2Ng-TRX6hSVE8TLWZUCiLecMZOr';
const SKIP_DRIVE_OPERATIONS = (process.env.SKIP_DRIVE_OPERATIONS || 'false').toLowerCase() === 'true';

async function getAuthClient() {
  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const keyJsonEnv = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const oauthClientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const oauthClientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const oauthRefreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  // Prefer OAuth2 (user account) when OAuth env vars are provided
  if (oauthClientId && oauthClientSecret && oauthRefreshToken) {
    const oAuth2Client = new google.auth.OAuth2(oauthClientId, oauthClientSecret);
    oAuth2Client.setCredentials({ refresh_token: oauthRefreshToken });
    await oAuth2Client.getAccessToken();
    return oAuth2Client;
  }

  if (keyJsonEnv) {
    let keyObj;
    try {
      keyObj = JSON.parse(keyJsonEnv);
    } catch (err) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON');
    }
    const client = new google.auth.JWT({
      email: keyObj.client_email,
      key: keyObj.private_key,
      scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets'],
    });
    await client.authorize();
    return client;
  }

  if (keyFile && fs.existsSync(keyFile)) {
    const auth = new google.auth.GoogleAuth({
      keyFile,
      scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets'],
    });
    return auth;
  }

  // Support OAuth2 using a refresh token (acts on behalf of a user)
  if (oauthClientId && oauthClientSecret && oauthRefreshToken) {
    const oAuth2Client = new google.auth.OAuth2(oauthClientId, oauthClientSecret);
    oAuth2Client.setCredentials({ refresh_token: oauthRefreshToken });
    // Ensure token is fresh/authorized
    await oAuth2Client.getAccessToken();
    return oAuth2Client;
  }

  throw new Error('Google credentials not found. Set GOOGLE_SERVICE_ACCOUNT_KEY (JSON) or GOOGLE_APPLICATION_CREDENTIALS (path)');
}

app.use(cors());
app.use(express.json());

app.post('/api/register', upload.any(), async (req, res) => {
  try {
    const required = ['firstName', 'lastName', 'idNumber', 'email'];
    const missing = required.filter((k) => !req.body[k] || String(req.body[k]).trim() === '');
    if (missing.length) {
      return res.status(400).json({ ok: false, error: `Faltan campos requeridos: ${missing.join(', ')}` });
    }

    const firstName = req.body.firstName.trim();
    const lastName = req.body.lastName.trim();
    const idNumber = req.body.idNumber.trim();
    const email = req.body.email.trim();

    // If SKIP_DRIVE_OPERATIONS is enabled, save locally and skip Drive/Sheets uploads.
    if (SKIP_DRIVE_OPERATIONS) {
      const folderName = `ENJ - ${firstName} ${lastName} (${idNumber}) - ${Date.now()}`;
      const baseDir = path.join(process.cwd(), 'server', 'mock_inscriptions');
      const folderPath = path.join(baseDir, folderName);
      fs.mkdirSync(folderPath, { recursive: true });

      const uploaded = [];
      for (const f of req.files || []) {
        const outPath = path.join(folderPath, f.originalname);
        fs.writeFileSync(outPath, f.buffer);
        uploaded.push({ fieldname: f.fieldname, path: outPath, name: f.originalname });
      }

      const dataJson = JSON.stringify(req.body, null, 2);
      const dataPath = path.join(folderPath, 'inscripcion.json');
      fs.writeFileSync(dataPath, dataJson);
      uploaded.push({ fieldname: 'inscripcion.json', path: dataPath, name: 'inscripcion.json' });

      // Optionally send admin email informing of local save
      const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
      if (ADMIN_EMAIL && process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: Number(process.env.SMTP_PORT || 587),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          const folderUrl = `file://${folderPath}`;
          const html = `<p>Nueva inscripción (modo local) guardada:</p>
            <ul>
              <li><strong>Nombre:</strong> ${firstName} ${lastName}</li>
              <li><strong>Cédula:</strong> ${idNumber}</li>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Carpeta local:</strong> ${folderPath}</li>
            </ul>`;

          await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: ADMIN_EMAIL,
            subject: `ENJ - Nueva inscripción (local): ${firstName} ${lastName}`,
            html,
          });
        } catch (err) {
          console.warn('Error sending admin email (local mode):', err.message || err);
        }
      }

      return res.json({ ok: true, local: true, folderPath, uploaded });
    }

    // Normal flow: perform Drive/Sheets operations
    if (idNumber) {
      const authDup = await getAuthClient();
      const driveDup = google.drive({ version: 'v3', auth: authDup });
      const q = `'${PARENT_FOLDER_ID}' in parents and name contains '${idNumber}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      const listRes = await driveDup.files.list({ q, fields: 'files(id,name)', spaces: 'drive' });
      if (listRes.data.files && listRes.data.files.length) {
        return res.status(409).json({ ok: false, error: 'Ya existe una inscripción con esa cédula.', existing: listRes.data.files });
      }
    }

    const auth = await getAuthClient();
    const drive = google.drive({ version: 'v3', auth });
    const sheets = google.sheets({ version: 'v4', auth });

    const folderName = `ENJ - ${firstName} ${lastName} (${idNumber}) - ${Date.now()}`;

    const parent = PARENT_FOLDER_ID ? [PARENT_FOLDER_ID] : [];
    const folderMeta = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parent,
      },
      fields: 'id,name',
    });
    const folderId = folderMeta.data.id;

    const uploaded = [];
    for (const f of req.files || []) {
      const fileStream = Readable.from(f.buffer);
      const fileMeta = await drive.files.create({
        requestBody: {
          name: f.originalname,
          parents: folderId ? [folderId] : undefined,
        },
        media: {
          mimeType: f.mimetype,
          body: fileStream,
        },
        fields: 'id, name',
      });
      uploaded.push({ fieldname: f.fieldname, id: fileMeta.data.id, name: fileMeta.data.name });
    }

    try {
      const dataJson = JSON.stringify(req.body, null, 2);
      const dataStream = Readable.from(dataJson);
      const dataFile = await drive.files.create({
        requestBody: {
          name: 'inscripcion.json',
          parents: folderId ? [folderId] : undefined,
          mimeType: 'application/json',
        },
        media: {
          mimeType: 'application/json',
          body: dataStream,
        },
        fields: 'id, name',
      });
      uploaded.push({ fieldname: 'inscripcion.json', id: dataFile.data.id, name: dataFile.data.name });
    } catch (err) {
      console.warn('No se pudo subir inscripcion.json:', err.message || err);
    }

    const sheetTitle = `${firstName} ${lastName} · ENJ`;
    const createResp = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title: sheetTitle },
      },
    });
    const spreadsheetId = createResp.data.spreadsheetId;

    const headers = Object.keys(req.body);
    const values = [headers, headers.map((k) => req.body[k])];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'A1',
      valueInputOption: 'RAW',
      requestBody: { values },
    });

    await drive.files.update({
      fileId: spreadsheetId,
      addParents: folderId,
      removeParents: process.env.DRIVE_PARENT_FOLDER_ID || undefined,
      fields: 'id, parents',
    });

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    if (ADMIN_EMAIL && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const folderUrl = `https://drive.google.com/drive/folders/${folderId}`;
        const sheetUrl = spreadsheetId ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}` : undefined;
        const html = `<p>Nueva inscripción recibida:</p>
          <ul>
            <li><strong>Nombre:</strong> ${firstName} ${lastName}</li>
            <li><strong>Cédula:</strong> ${idNumber}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Carpeta:</strong> <a href="${folderUrl}" target="_blank">${folderUrl}</a></li>
            ${sheetUrl ? `<li><strong>Hoja:</strong> <a href="${sheetUrl}" target="_blank">${sheetUrl}</a></li>` : ''}
          </ul>`;

        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: ADMIN_EMAIL,
          subject: `ENJ - Nueva inscripción: ${firstName} ${lastName}`,
          html,
        });
      } catch (err) {
        console.warn('Error sending admin email:', err.message || err);
      }
    }

    res.json({ ok: true, folderId, spreadsheetId, uploaded });
  } catch (err) {
    console.error(err);
    res.status(500).send(String(err.message || err));
  }
});

app.get('/api/test-email', async (_req, res) => {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  if (!ADMIN_EMAIL) return res.status(400).json({ ok: false, error: 'ADMIN_EMAIL not configured' });
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return res.status(400).json({ ok: false, error: 'SMTP credentials not configured' });

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: ADMIN_EMAIL,
      subject: 'ENJ - Prueba de correo',
      text: 'Este es un correo de prueba enviado desde el servidor ENJ.',
    });

    return res.json({ ok: true, message: 'Correo de prueba enviado' });
  } catch (err) {
    console.error('Error sending test email:', err);
    return res.status(500).json({ ok: false, error: String(err.message || err) });
  }
});

app.listen(PORT, () => {
  console.log(`ENJ server listening on http://localhost:${PORT}`);
});
