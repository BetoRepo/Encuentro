import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();

// Middlewares obligatorios
app.use(cors());
app.use(express.json());

// Leer credenciales de Supabase desde las Variables de Entorno de Vercel
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Inicialización defensiva
const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Ruta de prueba
app.get('/api', (req, res) => {
  res.json({ ok: true, message: 'Backend de ENJ 2026 corriendo en Vercel Serverless' });
});

// 1. RUTA DE REGISTRO
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ ok: false, error: 'El correo y la contraseña son obligatorios.' });
    if (!supabase) return res.status(500).json({ ok: false, error: 'Faltan credenciales de Supabase en Vercel.' });

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

// 2. RUTA DE INICIO DE SESIÓN (LOGIN) - CON LOGS DE INVESTIGACIÓN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'El correo y la contraseña son obligatorios.' });
    }

    if (!supabase) {
      return res.status(500).json({ ok: false, error: 'Error de configuración de Supabase.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim(); 

    // Consultar a Supabase
    const { data: user, error: loginError } = await supabase
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .eq('password', cleanPassword)
      .maybeSingle();
    
    // 🔍 ESTOS LOGS APARECERÁN EN TU PANEL DE VERCEL PARA SABER QUÉ PASA
    console.log("=== CONTROL DE BACKEND ===");
    console.log("1. Buscando email:", cleanEmail);
    console.log("2. ¿Qué devolvió la Base de Datos (user)?:", user);
    console.log("3. ¿Hubo algún error de conexión (error)?:", loginError);
    console.log("==========================");

    if (loginError) {
      return res.status(500).json({ ok: false, error: `Error de base de datos: ${loginError.message}` });
    }

    if (!user) {
      return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
    }

    return res.json({ ok: true, token: user.id, user: { email: user.email, name: user.name } });

  } catch (globalError) {
    console.error("Error crítico en login:", globalError);
    return res.status(500).json({ ok: false, error: `Excepción interna: ${globalError.message}` });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Servidor local en http://localhost:${PORT}`));
}

export default app;