app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Faltan campos obligatorios' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Validamos que el cliente de Supabase esté inicializado correctamente
    if (!supabase) {
      return res.status(500).json({ ok: false, error: 'El cliente de Supabase no está configurado.' });
    }

    // Buscamos si existe el correo en Supabase
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
    
    // Generamos un ID seguro en formato string
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newUser = { id: userId, email: cleanEmail, password, name };
    
    // Guardamos en la base de datos
    const { error: insertError } = await supabase.from('users').insert([newUser]);
    
    if (insertError) {
      return res.status(500).json({ ok: false, error: `Error al insertar: ${insertError.message}` });
    }

    return res.json({ ok: true, token: newUser.id, user: { email: cleanEmail, name } });

  } catch (globalError) {
    console.error("Error crítico en el registro:", globalError);
    return res.status(500).json({ ok: false, error: `Excepción del servidor: ${globalError.message}` });
  }
});

// 5. RUTA DE LOGIN INTEGRAL Y SEGURA
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Faltan campos obligatorios' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!supabase) {
      return res.status(500).json({ ok: false, error: 'El cliente de Supabase no está configurado.' });
    }

    // Validamos las credenciales contra la base de datos en Supabase
    const { data: user, error: loginError } = await supabase
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .eq('password', password)
      .maybeSingle();
    
    if (loginError || !user) {
      return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
    }

    return res.json({ ok: true, token: user.id, user: { email: user.email, name: user.name } });

  } catch (globalError) {
    console.error("Error crítico en el login:", globalError);
    return res.status(500).json({ ok: false, error: `Excepción del servidor: ${globalError.message}` });
  }
});