import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

const PASSWORD_PREFIX = 'scrypt$';

// Formato actual: scrypt$<sal aleatoria por usuario>$<hash>.
export const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${PASSWORD_PREFIX}${salt}$${hash}`;
};

const safeEqualHex = (a, b) => {
  const left = Buffer.from(a, 'hex');
  const right = Buffer.from(b, 'hex');
  return left.length === right.length && left.length > 0 && crypto.timingSafeEqual(left, right);
};

// Devuelve { valid, legacy }: legacy indica que el hash debe migrarse al formato con sal por usuario.
// legacySalts son las sales globales con que se guardaron las contraseñas antiguas (hash scrypt sin prefijo).
export const verifyPassword = async (password, storedHash, legacySalts = []) => {
  if (!storedHash) return { valid: false, legacy: false };
  if (storedHash.startsWith('$2')) return { valid: await bcrypt.compare(password, storedHash), legacy: true };
  if (storedHash.startsWith(PASSWORD_PREFIX)) {
    const [salt, hash] = storedHash.slice(PASSWORD_PREFIX.length).split('$');
    if (!salt || !hash) return { valid: false, legacy: false };
    return { valid: safeEqualHex(crypto.scryptSync(password, salt, 64).toString('hex'), hash), legacy: false };
  }
  const valid = legacySalts.some((salt) => safeEqualHex(crypto.scryptSync(password, salt, 64).toString('hex'), storedHash));
  return { valid, legacy: true };
};

// JWT HS256 que Supabase acepta como usuario "authenticated"; las políticas RLS leen sub con auth.jwt().
export const createSupabaseJwt = (user, secret, ttlSeconds, now = Math.floor(Date.now() / 1000)) => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const claims = Buffer.from(JSON.stringify({
    sub: user.id,
    email: user.email,
    role: 'authenticated',
    aud: 'authenticated',
    iat: now,
    exp: now + ttlSeconds,
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${claims}`).digest('base64url');
  return `${header}.${claims}.${signature}`;
};
