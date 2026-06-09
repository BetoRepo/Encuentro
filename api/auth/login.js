import fs from 'fs';
import path from 'path';
import os from 'os';

// Use a writable temp file for serverless environments (ephemeral)
const USERS_FILE = path.join(os.tmpdir(), 'enj-users.json');

const getUsers = () => {
  if (!fs.existsSync(USERS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  } catch (err) {
    return [];
  }
};

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  let body = '';
  req.on('data', (chunk) => { body += chunk; });
  req.on('end', () => {
    try {
      const { email, password } = JSON.parse(body || '{}');
      if (!email || !password) return res.status(400).json({ ok: false, error: 'Missing email or password' });

      const users = getUsers();
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
      return res.json({ ok: true, token: user.id, user: { email: user.email, name: user.name } });
    } catch (err) {
      return res.status(500).json({ ok: false, error: String(err.message || err) });
    }
  });
}
