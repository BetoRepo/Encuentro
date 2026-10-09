import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

import { hashPassword, verifyPassword, createSupabaseJwt } from './auth.mjs';

test('hashPassword usa una sal distinta en cada hash y verifyPassword la acepta', async () => {
  const first = hashPassword('clave-segura-1');
  const second = hashPassword('clave-segura-1');
  assert.notEqual(first, second);
  assert.deepEqual(await verifyPassword('clave-segura-1', first), { valid: true, legacy: false });
  assert.equal((await verifyPassword('otra-clave', first)).valid, false);
});

test('verifyPassword acepta hashes scrypt antiguos con sal global y los marca para migrar', async () => {
  const legacyHash = crypto.scryptSync('clave-antigua', 'sal-global', 64).toString('hex');
  assert.deepEqual(await verifyPassword('clave-antigua', legacyHash, ['otra-sal', 'sal-global']), { valid: true, legacy: true });
  assert.equal((await verifyPassword('clave-antigua', legacyHash, ['otra-sal'])).valid, false);
});

test('verifyPassword acepta hashes bcrypt de Supabase Auth y los marca para migrar', async () => {
  const bcryptHash = await bcrypt.hash('clave-bcrypt', 4);
  assert.deepEqual(await verifyPassword('clave-bcrypt', bcryptHash), { valid: true, legacy: true });
});

test('verifyPassword rechaza hashes vacíos o malformados', async () => {
  assert.equal((await verifyPassword('x', null)).valid, false);
  assert.equal((await verifyPassword('x', 'scrypt$solo-sal')).valid, false);
});

test('createSupabaseJwt firma un token authenticated verificable con el secreto', () => {
  const token = createSupabaseJwt({ id: 'usr_1', email: 'a@b.com' }, 'secreto', 3600, 1000);
  const [header, claims, signature] = token.split('.');
  const expected = crypto.createHmac('sha256', 'secreto').update(`${header}.${claims}`).digest('base64url');
  assert.equal(signature, expected);
  assert.deepEqual(JSON.parse(Buffer.from(claims, 'base64url').toString()), {
    sub: 'usr_1', email: 'a@b.com', role: 'authenticated', aud: 'authenticated', iat: 1000, exp: 4600,
  });
});
