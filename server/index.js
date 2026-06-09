import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js'; // <-- Conexión a la librería de Supabase

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// 1. INICIALIZAR EL CLIENTE DE SUPABASE
// Estas variables las leerá Vercel automáticamente desde la nube
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuración de Notificaciones Push (VAPID)
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || 'BEnS_vQyS_Lp7m-E_G5Z9W7W0Zq7V9Z7W0Zq7V9Z7W0Zq7V9Z7W0Zq7V9Z7W0Zq7V9Z7W0Zq7V9Z7A',
  privateKey: process.env.VAPID_PRIVATE_KEY || 'replace_with_real_private_key'
};

webpush.setVapidDetails(
  'mailto:tu@email.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// 2. MIDDLEWARE DE AUTENTICACIÓN ADAPTADO A SUPABASE
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ ok: false, error: 'No hay token' });

  const token = authHeader.split(' ')[1];
  
  // En lugar de buscar en el JSON local, buscamos en la tabla 'users' de Supabase
  const { data: user, error } = await supabase.from('users').select('*').eq('id', token).single();
  
  if (error || !user) {
    return res.status(401).json({ ok: false, error: 'No autorizado. Inicia sesión.' });
  }
  req.user = user;
  next();
};

// Middleware para verificar si el usuario es administrador
const isAdmin = (req, res, next) => {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  if (req.user && adminEmails.includes(req.user.email.toLowerCase())) {
    next();
  } else {
    res.status(403).json({ ok: false, error: 'Acceso denegado. No tienes permisos de administrador.' });
  }
};

const PARENT_FOLDER_ID = process.env.DRIVE_PARENT_FOLDER_ID || '1FeRqD2Ng-TRX6hSVE8TLWZUCiLecMZOr';

async function getAuthClient() {
  const keyJsonEnv = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

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

  throw new Error('Google credentials not found. En Vercel debes configurar GOOGLE_SERVICE_ACCOUNT_KEY en las variables de entorno.');
}

app.use(cors());
app.use(express.json());

app.get('/api/notifications/key', (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

// 3. RUTA DE SUSCRIPCIÓN PUSH ADAPTADA A SUPABASE
app.post('/api/notifications/subscribe', authenticateUser, async (req, res) => {
  const subscription = req.body;
  
  // Guardamos la suscripción en la tabla 'subscriptions' evitando duplicados
  const { error } = await supabase.from('subscriptions').upsert({
    endpoint: subscription.endpoint,
    expiration_time: subscription.expirationTime ? String(subscription.expirationTime) : null,
    p256dh: subscription.keys?.p256dh || '',
    auth: subscription.keys?.auth || ''
  }, { onConflict: 'endpoint' });

  if (error) return res.status(500).json({ ok: false, error: error.message });
  res.status(201).json({ ok: true });
});

// 4. RUTA DE REGISTRO ADAPTADA A SUPABASE
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;

  // Verificamos si ya existe el correo en la base de datos de Supabase
  const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).single();
  if (existingUser) return res.status(400).json({ ok: false, error: 'Usuario ya existe' });
  
  const newUser = { id: Date.now().toString(), email, password, name };
  
  // Insertamos el nuevo usuario en la tabla 'users'
  const { error } = await supabase.from('users').insert([newUser]);
  if (error) return res.status(500).json({ ok: false, error: error.message });

  res.json({ ok: true, token: newUser.id, user: { email, name } });
});

// 5. RUTA DE INICIO DE SESIÓN ADAPTADA A SUPABASE
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Buscamos si hay un usuario con ese email Y esa contraseña en Supabase
  const { data: user, error } = await supabase.from('users').select('*').eq('email', email).eq('password', password).single();
  
  if (error || !user) return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
  res.json({ ok: true, token: user.id, user: { email: user.email, name: user.name } });
});

app.get('/api/auth/me', authenticateUser, (req, res) => {
  res.json({ ok: true, user: req.user });
});

// El resto de tu código de Google Drive, Sheets y Email se queda exactamente IGUAL
app.post('/api/register', authenticateUser, upload.any(), async (req, res) => {
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
      const fileMeta = await drive.files.create({
        requestBody: {
          name: f.originalname,
          parents: folderId ? [folderId] : undefined,
        },
        media: {
          mimeType: f.mimetype,
          body: Buffer.from(f.buffer),
        },
        fields: 'id, name',
      });
      uploaded.push({ fieldname: f.fieldname, id: fileMeta.data.id, name: fileMeta.data.name });
    }

    try {
      const dataJson = JSON.stringify(req.body, null, 2);
      const dataFile = await drive.files.create({
        requestBody: {
          name: 'inscripcion.json',
          parents: folderId ? [folderId] : undefined,
          mimeType: 'application/json',
        },
        media: {
          mimeType: 'application/json',
          body: Buffer.from(dataJson),
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
      removeParents: PARENT_FOLDER_ID || undefined,
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

app.get('/api/admin/registrations', authenticateUser, isAdmin, async (req, res) => {
  try {
    const auth = await getAuthClient();
    const drive = google.drive({ version: 'v3', auth });
    
    const q = `'${PARENT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const listRes = await drive.files.list({ q, fields: 'files(id, name, createdTime)', orderBy: 'createdTime desc' });
    
    res.json({ ok: true, registrations: listRes.data.files });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// SOLO ESCUCHAR PUERTO EN ENTORNO LOCAL
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Servidor local ejecutándose en puerto ${PORT}`));
}

export default app;