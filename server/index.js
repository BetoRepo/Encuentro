import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import webpush from 'web-push';
import { buildDashboardPayload } from './dashboardData.mjs';
import { hashPassword, verifyPassword as verifyPasswordHash, createSupabaseJwt } from './auth.mjs';

const app = express();
// Vercel envía la IP real en X-Forwarded-For; se usa para el límite de intentos.
app.set('trust proxy', true);

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  if (!req.url.startsWith('/api')) req.url = `/api${req.url}`;
  next();
});

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// Sin SESSION_SECRET no se emiten ni aceptan sesiones: un valor por defecto permitiría falsificar tokens.
const sessionSecret = process.env.SESSION_SECRET && process.env.SESSION_SECRET !== 'enj-change-this-session-secret' ? process.env.SESSION_SECRET : null;
// Secreto JWT del proyecto Supabase: permite que RLS identifique al usuario con auth.jwt().
const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET || null;
// Las contraseñas antiguas se guardaron con scrypt usando el secreto de sesión (o este valor por defecto) como sal.
const LEGACY_PASSWORD_SALTS = [process.env.SESSION_SECRET, process.env.LEGACY_PASSWORD_SALT, 'enj-change-this-session-secret'].filter(Boolean);

if (!sessionSecret) console.error('SESSION_SECRET no está configurado: el inicio de sesión está deshabilitado.');
if (!supabaseJwtSecret) console.warn('SUPABASE_JWT_SECRET no está configurado: el frontend usará la clave anon y RLS no podrá identificar usuarios.');

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
const serviceSupabase = (supabaseUrl && serviceRoleKey)
  ? createClient(supabaseUrl, serviceRoleKey, { global: { fetch: fetchWithTimeout } })
  : null;
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT;
const pushReady = Boolean(vapidPublicKey && vapidPrivateKey && vapidSubject);

if (pushReady) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const DB_TOKEN_TTL_SECONDS = 60 * 60 * 12;

const createToken = (user) => {
  const payload = Buffer.from(JSON.stringify({ sub: user.id, exp: Date.now() + SESSION_TTL_MS })).toString('base64url');
  const signature = crypto.createHmac('sha256', sessionSecret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
};

const createDbToken = (user) => (supabaseJwtSecret ? createSupabaseJwt(user, supabaseJwtSecret, DB_TOKEN_TTL_SECONDS) : null);

const sessionResponse = (user) => ({ ok: true, token: createToken(user), dbToken: createDbToken(user), user: publicUser(user) });

const verifyPassword = (password, storedHash) => verifyPasswordHash(password, storedHash, LEGACY_PASSWORD_SALTS);

const getAuthenticatedUser = async (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token || !supabase || !sessionSecret) return null;
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

const getProgramManager = async (req) => {
  const user = await getAuthenticatedUser(req);
  if (!user) return { error: { status: 401, message: 'Inicia sesión para gestionar alarmas.' } };
  if (!['admin', 'programa'].includes(user.role)) return { error: { status: 403, message: 'No tienes permiso para gestionar alarmas.' } };
  if (!serviceSupabase) return { error: { status: 503, message: 'Falta configurar SUPABASE_SERVICE_ROLE_KEY en el servidor para operar con RLS habilitado.' } };
  return { user, database: serviceSupabase };
};

const parseBcvRate = (payload) => {
  if (!payload || typeof payload !== 'object') return null;

  const candidates = [
    payload.tasa,
    payload.tasa_dolar,
    payload.rate,
    payload.value,
    payload.promedio,
    payload.dolar,
    payload?.data?.tasa,
    payload?.data?.tasa_dolar,
    payload?.data?.rate,
    payload?.data?.value,
    payload?.data?.promedio,
    payload?.data?.dolar,
  ];

  for (const value of candidates) {
    const sanitized = Number(String(value).replace(/[^0-9.,-]/g, '').replace(',', '.'));
    if (Number.isFinite(sanitized) && sanitized > 0) return sanitized;
  }

  if (Array.isArray(payload.data)) {
    for (const item of payload.data) {
      const value = parseBcvRate(item);
      if (value) return value;
    }
  }

  return null;
};

// Devuelve { rate, estimated }. estimated=true significa que ninguna API respondió y la tasa es la última conocida o la de respaldo.
let lastKnownBcvRate = null;
const fetchBcvRate = async () => {
  const fallbackRate = Number(process.env.BCV_FALLBACK_RATE) || 39;
  const endpoints = [
    'https://ve.dolarapi.com/v1/dolares/oficial',
    'https://ve.dolarapi.com/v1/dolares',
    'https://api.bcv.org.ve/tasa-informativa',
    'https://api.bcv.org.ve/data/',
    'https://api.bcv.org.ve/tasa',
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetchWithTimeout(endpoint, { headers: { Accept: 'application/json' } });
      if (!response.ok) continue;
      const payload = await response.json();

      const parsed = parseBcvRate(payload);
      if (parsed) {
        lastKnownBcvRate = parsed;
        return { rate: parsed, estimated: false };
      }
    } catch (error) {
      console.warn(`BCV fetch falló para ${endpoint}:`, error.message);
    }
  }

  return { rate: lastKnownBcvRate || fallbackRate, estimated: true };
};

// Límite de intentos en memoria: en Vercel cada instancia lleva su propio conteo, pero frena ataques de fuerza bruta simples.
const attempts = new Map();
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX_ATTEMPTS = 10;
const isRateLimited = (key) => {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.start > RATE_WINDOW_MS) {
    attempts.set(key, { start: now, count: 1 });
    if (attempts.size > 5000) attempts.clear();
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_MAX_ATTEMPTS;
};

const authUnavailable = (res) => res.status(503).json({ ok: false, error: 'El inicio de sesión no está configurado en el servidor (falta SESSION_SECRET).' });


// Ruta de prueba
app.get('/api', (req, res) => {
  res.json({ ok: true, message: 'Backend corriendo correctamente' });
});

// 1. RUTA DE REGISTRO
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!sessionSecret) return authUnavailable(res);
    if (typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({ ok: false, error: 'Campos obligatorios incompletos.' });
    if (!supabase) return res.status(500).json({ ok: false, error: 'La conexión con la base de datos no está configurada.' });

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return res.status(400).json({ ok: false, error: 'El correo no es válido.' });
    if (cleanPassword.length < 8) return res.status(400).json({ ok: false, error: 'La contraseña debe tener al menos 8 caracteres.' });

    const { data: existingUser, error: searchError } = await withTimeout(supabase
      .from('user')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle());

    if (searchError) return res.status(500).json({ ok: false, error: searchError.message });
    if (existingUser) return res.status(400).json({ ok: false, error: 'Usuario ya existe' });
    
    const userId = `usr_${crypto.randomUUID()}`;
    const newUser = { id: userId, email: cleanEmail, password_hash: hashPassword(cleanPassword), name: String(name || '').trim().slice(0, 120), role: 'participant' };

    const { error: insertError } = await withTimeout(supabase.from('user').insert([newUser]));
    if (insertError) return res.status(500).json({ ok: false, error: insertError.message });

    return res.json(sessionResponse(newUser));
  } catch (globalError) {
    return res.status(500).json({ ok: false, error: globalError.message });
  }
});

// 2. RUTA DE INICIO DE SESIÓN (LOGIN)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!sessionSecret) return authUnavailable(res);
    if (typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({ ok: false, error: 'Faltan campos' });
    if (!supabase) return res.status(500).json({ ok: false, error: 'La conexión con la base de datos no está configurada.' });

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    if (isRateLimited(`login:${req.ip}:${cleanEmail}`)) return res.status(429).json({ ok: false, error: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.' });

    const { data: user, error: loginError } = await withTimeout(supabase
      .from('user')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle());

    if (loginError) return res.status(500).json({ ok: false, error: loginError.message });

    const check = user ? await verifyPassword(cleanPassword, user.password_hash) : { valid: false };
    if (!check.valid) return res.status(401).json({ ok: false, error: 'Correo o contraseña incorrectos.' });

    if (check.legacy) {
      // Migra el hash antiguo al formato con sal por usuario sin interrumpir el inicio de sesión.
      const { error: migrateError } = await withTimeout(supabase.from('user').update({ password_hash: hashPassword(cleanPassword) }).eq('id', user.id));
      if (migrateError) console.warn('No se pudo migrar el hash de contraseña:', migrateError.message);
    }

    return res.json(sessionResponse(user));
  } catch (globalError) {
    return res.status(500).json({ ok: false, error: globalError.message });
  }
});

// Requiere sesión activa, o correo + contraseña actual. Nunca permite cambiar la clave solo con el correo.
app.post('/api/auth/change-password', async (req, res) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    if (!sessionSecret) return authUnavailable(res);
    if (!supabase) return res.status(503).json({ ok: false, error: 'La conexión con la base de datos no está configurada.' });

    let user = await getAuthenticatedUser(req);
    if (!user) {
      const cleanEmail = String(body.email || '').trim().toLowerCase();
      const currentPassword = String(body.currentPassword || '').trim();
      if (!cleanEmail || !currentPassword) return res.status(401).json({ ok: false, error: 'Indica tu correo y tu contraseña actual.' });
      if (isRateLimited(`change:${req.ip}:${cleanEmail}`)) return res.status(429).json({ ok: false, error: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.' });
      const { data: account } = await withTimeout(supabase.from('user').select('id, password_hash').eq('email', cleanEmail).maybeSingle());
      const check = account ? await verifyPassword(currentPassword, account.password_hash) : { valid: false };
      if (!check.valid) return res.status(401).json({ ok: false, error: 'Correo o contraseña actual incorrectos.' });
      user = account;
    }

    const newPassword = String(body.newPassword || '').trim();
    if (newPassword.length < 8) return res.status(400).json({ ok: false, error: 'La nueva contraseña debe tener al menos 8 caracteres.' });
    const { error: updateError } = await withTimeout(supabase.from('user').update({ password_hash: hashPassword(newPassword) }).eq('id', user.id));
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
    // Devuelve el rol actual de la base de datos y un token de base de datos renovado.
    return res.json({ ok: true, dbToken: createDbToken(user), user: publicUser(user) });
  } catch (globalError) {
    return res.status(500).json({ ok: false, error: globalError.message });
  }
});

app.get('/api/programa/alarmas', async (req, res) => {
  try {
    const access = await getProgramManager(req);
    if (access.error) return res.status(access.error.status).json({ ok: false, error: access.error.message });

    const { data, error } = await withTimeout(access.database
      .from('programa_alarmas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(15));
    if (error) throw error;
    return res.json({ ok: true, alarmas: data || [] });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'No se pudo cargar el historial de alarmas.' });
  }
});

app.post('/api/programa/alarmas', async (req, res) => {
  try {
    const access = await getProgramManager(req);
    if (access.error) return res.status(access.error.status).json({ ok: false, error: access.error.message });

    const titulo = String(req.body?.titulo || '').trim().slice(0, 120);
    const descripcion = String(req.body?.descripcion || '').trim().slice(0, 4000);
    const prioridad = ['informativa', 'importante', 'critica'].includes(req.body?.prioridad) ? req.body.prioridad : null;
    const audiencia = ['todos', 'subcampo_1', 'subcampo_2', 'subcampo_3', 'jefes_unidad'].includes(req.body?.audiencia) ? req.body.audiencia : null;
    if (!titulo || !descripcion || !prioridad || !audiencia) {
      return res.status(400).json({ ok: false, error: 'Revisa el título, mensaje, prioridad y audiencia.' });
    }

    const { data, error } = await withTimeout(access.database
      .from('programa_alarmas')
      .insert({ titulo, descripcion, prioridad, audiencia, estado: 'publicada' })
      .select('*')
      .single());
    if (error) throw error;
    return res.status(201).json({ ok: true, alarma: data });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'No se pudo emitir la alarma.' });
  }
});

app.patch('/api/programa/alarmas/:id', async (req, res) => {
  try {
    const access = await getProgramManager(req);
    if (access.error) return res.status(access.error.status).json({ ok: false, error: access.error.message });
    if (req.body?.estado !== 'cancelada') return res.status(400).json({ ok: false, error: 'El estado solicitado no es válido.' });

    const { error } = await withTimeout(access.database
      .from('programa_alarmas')
      .update({ estado: 'cancelada' })
      .eq('id', req.params.id));
    if (error) throw error;
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'No se pudo cancelar la alarma.' });
  }
});

app.get('/api/notifications/key', (_req, res) => {
  if (!pushReady) return res.status(503).json({ ok: false, error: 'Las notificaciones push no están configuradas.' });
  return res.json({ ok: true, publicKey: vapidPublicKey });
});

app.post('/api/notifications/subscribe', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ ok: false, error: 'Inicia sesión para activar las notificaciones.' });
    if (!pushReady) return res.status(503).json({ ok: false, error: 'Las notificaciones push no están configuradas.' });
    if (!serviceSupabase) return res.status(503).json({ ok: false, error: 'Falta configurar SUPABASE_SERVICE_ROLE_KEY en el servidor.' });

    const subscription = req.body;
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return res.status(400).json({ ok: false, error: 'La suscripción enviada no es válida.' });
    }

    const { error } = await withTimeout(serviceSupabase.from('subscriptions').upsert({
      user_id: user.id,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    }, { onConflict: 'endpoint' }));
    if (error) throw error;
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'No se pudo guardar la suscripción.' });
  }
});

app.post('/api/notifications/publish', async (req, res) => {
  try {
    const access = await getProgramManager(req);
    if (access.error) return res.status(access.error.status).json({ ok: false, error: access.error.message });
    if (!pushReady) return res.status(503).json({ ok: false, error: 'Las notificaciones push no están configuradas.' });

    const titulo = String(req.body?.titulo || '').trim().slice(0, 120);
    const descripcion = String(req.body?.descripcion || '').trim().slice(0, 2000);
    const id = String(req.body?.id || '').trim();
    const prioridad = ['informativa', 'importante', 'critica'].includes(req.body?.prioridad) ? req.body.prioridad : 'informativa';
    if (!titulo || !descripcion || !id) return res.status(400).json({ ok: false, error: 'Faltan datos de la alarma.' });

    const { data: subscriptions, error } = await withTimeout(serviceSupabase
      .from('subscriptions')
      .select('endpoint, keys'));
    if (error) throw error;

    const results = await Promise.allSettled((subscriptions || []).map(async (subscription) => {
      try {
        await webpush.sendNotification(subscription, JSON.stringify({ titulo: `ENJ 2026: ${titulo}`, descripcion, id, prioridad, url: '/' }), {
          TTL: 3600,
          urgency: prioridad === 'critica' ? 'high' : 'normal',
        });
        return true;
      } catch (pushError) {
        if (pushError.statusCode === 404 || pushError.statusCode === 410) {
          await serviceSupabase.from('subscriptions').delete().eq('endpoint', subscription.endpoint);
        }
        throw pushError;
      }
    }));

    const sent = results.filter((result) => result.status === 'fulfilled').length;
    return res.json({ ok: true, sent, failed: results.length - sent });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'No se pudieron enviar las notificaciones.' });
  }
});

app.get('/api/dashboard', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ ok: false, error: 'Sesión inválida o expirada.' });
    if (user.role !== 'admin') return res.status(403).json({ ok: false, error: 'No tienes permisos para ver el dashboard.' });

    const [
      { data: participants, error: participantsError },
      { data: payments, error: paymentsError },
      { data: documents, error: documentsError },
    ] = await Promise.all([
      supabase.from('participantes').select('*').order('created_at', { ascending: false }),
      supabase.from('pagos').select('*').order('created_at', { ascending: false }),
      supabase.from('documentos_participante').select('*').order('created_at', { ascending: false }),
    ]);

    if (participantsError) throw participantsError;
    if (paymentsError) throw paymentsError;
    if (documentsError) throw documentsError;

    const { rate: bcvRate, estimated } = await fetchBcvRate();
    const payload = buildDashboardPayload({ participants: participants || [], payments: payments || [], documents: documents || [], bcvRate });
    return res.json({ ok: true, ...payload, bcvRateEstimated: estimated });
  } catch (globalError) {
    return res.status(500).json({ ok: false, error: globalError.message });
  }
});

app.get('/api/tasa-bcv', async (_req, res) => {
  const { rate, estimated } = await fetchBcvRate();
  res.set('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
  return res.json({ ok: true, rate, estimated });
});

app.post('/api/notify-drive-failure', (req, res) => {
  return res.status(501).json({ ok: false, error: 'Las notificaciones por correo están desactivadas.' });
});

app.use((req, res) => {
  return res.status(404).json({ ok: false, error: `Ruta no encontrada: ${req.method} ${req.path}` });
});

if (process.env.NODE_ENV !== 'production') {
  // Debe coincidir con el proxy de /api en vite.config.ts.
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Servidor local en puerto ${PORT}`));
}

export default app;