import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

const app = express();

app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const sessionSecret = process.env.SESSION_SECRET || 'enj-change-this-session-secret';

const fetchWithTimeout = async (input, init = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

const withTimeout = (promise, milliseconds = 7000) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error('La base de datos tardó demasiado en responder.')), milliseconds)),
]);

const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey, { global: { fetch: fetchWithTimeout } }) 
  : null;

const createToken = (user) => {
  const payload = Buffer.from(JSON.stringify({ sub: user.id, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 })).toString('base64url');
  const signature = crypto.createHmac('sha256', sessionSecret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
};

const getAuthenticatedUser = async (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token || !supabase) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expectedSignature = crypto.createHmac('sha256', sessionSecret).update(payload).digest('base64url');
  if (signature.length !== expectedSignature.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) return null;
  let tokenData;
  try {
    tokenData = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (!tokenData.sub || tokenData.exp < Date.now()) return null;
  const { data: user } = await withTimeout(supabase.from('user').select('id, email, name, role').eq('id', tokenData.sub).maybeSingle());
  return user || null;
};

const publicUser = (user) => ({ id: user.id, email: user.email, name: user.name || '', role: user.role || 'participant' });

const verifyPassword = async (password, storedHash) => {
  if (storedHash?.startsWith('$2')) return bcrypt.compare(password, storedHash);
  const candidateHash = crypto.scryptSync(password, sessionSecret, 64).toString('hex');
  return storedHash === candidateHash;
};


// Ruta de prueba
app.get('/api', (req, res) => {
  res.json({ ok: true, message: 'Backend corriendo correctamente' });
});

// 1. RUTA DE REGISTRO
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ ok: false, error: 'Campos obligatorios incompletos.' });
    if (!supabase) return res.status(500).json({ ok: false, error: 'La conexión con la base de datos no está configurada.' });

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (cleanPassword.length < 8) return res.status(400).json({ ok: false, error: 'La contraseña debe tener al menos 8 caracteres.' });

    const { data: existingUser, error: searchError } = await withTimeout(supabase
      .from('user')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle());

    if (searchError) return res.status(500).json({ ok: false, error: searchError.message });
    if (existingUser) return res.status(400).json({ ok: false, error: 'Usuario ya existe' });
    
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const passwordHash = crypto.scryptSync(cleanPassword, sessionSecret, 64).toString('hex');
    const newUser = { id: userId, email: cleanEmail, password_hash: passwordHash, name: name || '', role: 'participant' };
    
    const { error: insertError } = await withTimeout(supabase.from('user').insert([newUser]));
    if (insertError) return res.status(500).json({ ok: false, error: insertError.message });

    return res.json({ ok: true, token: createToken(newUser), user: publicUser(newUser) });
  } catch (globalError) {
    return res.status(500).json({ ok: false, error: globalError.message });
  }
});

// 2. RUTA DE INICIO DE SESIÓN (LOGIN)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ ok: false, error: 'Faltan campos' });
    if (!supabase) return res.status(500).json({ ok: false, error: 'La conexión con la base de datos no está configurada.' });

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim(); 

    const { data: user, error: loginError } = await withTimeout(supabase
      .from('user')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle());
    
    if (loginError) return res.status(500).json({ ok: false, error: loginError.message });
    if (!user) return res.status(401).json({ ok: false, error: 'Usuario no encontrado' });

    if (!(await verifyPassword(cleanPassword, user.password_hash))) {
      return res.status(401).json({ ok: false, error: 'Contraseña incorrecta' });
    }

    return res.json({ ok: true, token: createToken(user), user: publicUser(user) });
  } catch (globalError) {
    return res.status(500).json({ ok: false, error: globalError.message });
  }
});

app.post('/api/auth/change-password', async (req, res) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    if (!supabase) return res.status(503).json({ ok: false, error: 'La conexión con la base de datos no está configurada.' });
    let user = await getAuthenticatedUser(req);
    if (!user && body.email) {
      const cleanEmail = String(body.email).trim().toLowerCase();
      const { data: account } = await withTimeout(supabase.from('user').select('id').eq('email', cleanEmail).maybeSingle());
      user = account;
    }
    if (!user) return res.status(401).json({ ok: false, error: 'Indica el correo de la cuenta para cambiar la contraseña.' });
    const { newPassword } = body;
    if (!newPassword || newPassword.length < 8) return res.status(400).json({ ok: false, error: 'La nueva contraseña debe tener al menos 8 caracteres.' });
    const passwordHash = crypto.scryptSync(newPassword, sessionSecret, 64).toString('hex');
    const { error: updateError } = await withTimeout(supabase.from('user').update({ password_hash: passwordHash }).eq('id', user.id));
    if (updateError) throw updateError;
    return res.json({ ok: true, message: 'Contraseña actualizada correctamente.' });
  } catch (globalError) {
    console.error('change-password error:', globalError);
    return res.status(500).json({ ok: false, error: globalError.message });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ ok: false, error: 'Sesión inválida o expirada.' });
    return res.json({ ok: true, user: publicUser(user) });
  } catch (globalError) {
    return res.status(500).json({ ok: false, error: globalError.message });
  }
});

app.get('/api/dashboard', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ ok: false, error: 'Sesión inválida o expirada.' });
    if (user.role !== 'admin') return res.status(403).json({ ok: false, error: 'No tienes permisos para ver el dashboard.' });
    const [{ count: participants, error: participantsError }, { data: payments, error: paymentsError }] = await Promise.all([
      supabase.from('participantes').select('cedula', { count: 'exact', head: true }),
      supabase.from('pagos').select('monto_bs'),
    ]);
    if (participantsError) throw participantsError;
    if (paymentsError) throw paymentsError;
    const totalAmount = (payments || []).reduce((sum, payment) => sum + (Number(payment.monto_bs) || 0), 0);
    return res.json({ ok: true, metrics: { participants: participants || 0, payments: payments?.length || 0, totalAmount } });
  } catch (globalError) {
    return res.status(500).json({ ok: false, error: globalError.message });
  }
});

app.post('/api/notify-drive-failure', async (req, res) => {
  try {
    const { recipients, subject, body } = req.body;
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ ok: false, error: 'Recipients list required.' });
    }
    if (!subject || !body) {
      return res.status(400).json({ ok: false, error: 'Subject and body are required.' });
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({ ok: false, error: 'SMTP configuration missing.' });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: recipients.join(','),
      subject,
      html: `<p>${body.replace(/\n/g, '<br/>')}</p>`,
    });

    return res.json({ ok: true, message: 'Correo enviado', info });
  } catch (err) {
    console.error('Notify drive failure error:', err);
    return res.status(500).json({ ok: false, error: String(err.message || err) });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Servidor local en puerto ${PORT}`));
}

export default app;