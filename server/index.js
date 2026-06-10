import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();

app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Ruta de prueba
app.get('/api', (req, res) => {
  res.json({ ok: true, message: 'Backend corriendo correctamente' });
});

// 1. RUTA DE REGISTRO
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ ok: false, error: 'Campos obligatorios incompletos.' });
    if (!supabase) return res.status(500).json({ ok: false, error: 'Faltan credenciales de Supabase.' });

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const { data: existingUser, error: searchError } = await supabase
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (searchError) return res.status(500).json({ ok: false, error: searchError.message });
    if (existingUser) return res.status(400).json({ ok: false, error: 'Usuario ya existe' });
    
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newUser = { id: userId, email: cleanEmail, password: cleanPassword, name: name || '' };
    
    const { error: insertError } = await supabase.from('users').insert([newUser]);
    if (insertError) return res.status(500).json({ ok: false, error: insertError.message });

    return res.json({ ok: true, token: newUser.id, user: { email: cleanEmail, name: newUser.name } });
  } catch (globalError) {
    return res.status(500).json({ ok: false, error: globalError.message });
  }
});

// 2. RUTA DE INICIO DE SESIÓN (LOGIN) - MODO DIAGNÓSTICO ABSOLUTO
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Falta escribir el correo o la contraseña.' });
    }

    if (!supabase) {
      return res.status(500).json({ ok: false, error: 'Error: El backend no está conectado a Supabase.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim(); 

    // PASO 1: Busquemos al usuario ÚNICAMENTE por su correo
    const { data: user, error: loginError } = await supabase
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();
    
    if (loginError) {
      return res.status(500).json({ ok: false, error: `Error directo de Supabase: ${loginError.message}` });
    }

    // SI SUPABASE NO DEVUELVE NADA: El 99% de las veces es por el bloqueo RLS de la tabla
    if (!user) {
      return res.status(401).json({ 
        ok: false, 
        error: `El correo [${cleanEmail}] no devolvió datos. Esto significa que la tabla 'users' tiene el bloqueo RLS activado en Supabase y no permite leer filas públicamente.` 
      });
    }

    // PASO 2: Si el usuario existe, comparemos las contraseñas cara a cara
    if (user.password !== cleanPassword) {
      return res.status(401).json({ 
        ok: false, 
        error: `Contraseña incorrecta. El formulario envió: [${cleanPassword}], pero la base de datos tiene guardado: [${user.password}].` 
      });
    }

    // Si todo coincide perfectamente
    return res.json({ ok: true, token: user.id, user: { email: user.email, name: user.name } });

  } catch (globalError) {
    return res.status(500).json({ ok: false, error: `Error interno del servidor: ${globalError.message}` });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Servidor local en puerto ${PORT}`));
}

export default app;