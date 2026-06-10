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

// Inicialización defensiva: Evita que el servidor colapse si las variables están vacías
const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Ruta de prueba para verificar que el backend responde en Vercel
app.get('/api', (req, res) => {
  res.json({ ok: true, message: 'Backend de ENJ 2026 corriendo en Vercel Serverless' });
});

// 1. RUTA DE REGISTRO
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'El correo y la contraseña son obligatorios.' });
    }

    if (!supabase) {
      return res.status(500).json({ ok: false, error: 'Error de configuración: Faltan SUPABASE_URL o SUPABASE_ANON_KEY en Vercel.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim(); // Limpieza preventiva al registrar

    // Verificar si el usuario ya existe en Supabase
    const { data: existingUser, error: searchError } = await supabase
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (searchError) {
      return res.status(500).json({ ok: false, error: `Error de Supabase: ${searchError.message}` });
    }

    if (existingUser) {
      return res.status(400).json({ ok: false, error: 'Usuario ya existe' });
    }
    
    // Generar un ID único seguro
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newUser = { id: userId, email: cleanEmail, password: cleanPassword, name: name || '' };
    
    // Insertar en la tabla 'users'
    const { error: insertError } = await supabase.from('users').insert([newUser]);
    
    if (insertError) {
      return res.status(500).json({ ok: false, error: `Error al insertar usuario: ${insertError.message}` });
    }

    return res.json({ ok: true, token: newUser.id, user: { email: cleanEmail, name: newUser.name } });

  } catch (globalError) {
    console.error("Error en registro:", globalError);
    return res.status(500).json({ ok: false, error: `Excepción interna: ${globalError.message}` });
  }
});

// 2. RUTA DE INICIO DE SESIÓN (LOGIN) - CORREGIDA
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'El correo y la contraseña son obligatorios.' });
    }

    if (!supabase) {
      return res.status(500).json({ ok: false, error: 'Error de configuración: Faltan las credenciales de Supabase en Vercel.' });
    }

    // APLICAMOS TRIM PARA QUITAR ESPACIOS INVISIBLES DEL FORMULARIO
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim(); 

    // Validar credenciales directamente en la tabla usando los valores limpios
    const { data: user, error: loginError } = await supabase
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .eq('password', cleanPassword)
      .maybeSingle();
    
    if (loginError) {
      return res.status(500).json({ ok: false, error: `Error de base de datos: ${loginError.message}` });
    }

    if (!user) {
      return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
    }

    return res.json({ ok: true, token: user.id, user: { email: user.email, name: user.name } });

  } catch (globalError) {
    console.error("Error en login:", globalError);
    return res.status(500).json({ ok: false, error: `Excepción interna: ${globalError.message}` });
  }
});

// Levantar puerto únicamente si estás ejecutando de forma Local (No en producción)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Servidor local en http://localhost:${PORT}`));
}

// EXPORTACIÓN OBLIGATORIA PARA EL PUENTE DE VERCEL
export default app;