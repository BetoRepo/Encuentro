# ENJ 2026

Aplicación web (PWA) del Encuentro Nacional de Jóvenes: inscripción, pagos, perfil scout, insignias, panel de programa y dashboard administrativo.

- **Frontend:** React 18 + Vite + Tailwind (`src/`)
- **Backend:** Express desplegado como función de Vercel (`server/index.js`, expuesto por `api/[...all].js`)
- **Base de datos:** Supabase (Postgres + Storage)

## Desarrollo local

```bash
npm install
cp .env.example .env   # y completa los valores
npm run dev:server     # backend en http://localhost:3001
npm run dev            # frontend; /api se redirige al backend
```

Otros scripts: `npm run typecheck`, `npm test`, `npm run build`.

## Autenticación y seguridad

El inicio de sesión es propio (tabla `public."user"`), no Supabase Auth.

1. El backend valida correo y contraseña y devuelve dos tokens:
   - `token`: sesión de la aplicación, firmada con `SESSION_SECRET`.
   - `dbToken`: JWT firmado con `SUPABASE_JWT_SECRET` (`sub` = id del usuario, `role` = `authenticated`).
2. El frontend envía `dbToken` en cada consulta a Supabase, así las políticas RLS saben quién es el usuario (`public.app_uid()`) y cuál es su rol real (`public.app_role()`, leído de la tabla `user`).
3. La tabla `user` (con los hashes de contraseña) solo la lee el backend con la service role key.

Las contraseñas se guardan con scrypt y sal aleatoria por usuario. Los hashes antiguos (sal global o bcrypt de Supabase Auth) se aceptan y se migran solos en el siguiente inicio de sesión.

Las políticas están en `supabase/migrations/`. El `RoleGuard` del frontend solo oculta pantallas; la protección real es RLS.

## Variables de entorno (Vercel)

Ver `.env.example`. Las imprescindibles en producción:

| Variable | Para qué |
|---|---|
| `SESSION_SECRET` | Firmar sesiones. Sin ella el login responde 503. |
| `SUPABASE_SERVICE_ROLE_KEY` | Acceso del backend a tablas protegidas. Secreta. |
| `SUPABASE_JWT_SECRET` | Emitir el `dbToken` para RLS. Secreta. |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | Notificaciones push. |

Si el servidor ya tenía un `SESSION_SECRET` antes, mantén el mismo valor (o ponlo en `LEGACY_PASSWORD_SALT`) para que las contraseñas existentes sigan funcionando.

Genera las claves VAPID una sola vez:

```bash
node -e "import('web-push').then(({ default: push }) => console.log(push.generateVAPIDKeys()))"
```

## Notificaciones push

Las alarmas del Panel de Programa se emiten desde el backend, que valida el rol `admin`/`programa`. Cada usuario debe iniciar sesión, permitir notificaciones y activarlas desde la campana o el Panel de Programa. Web Push requiere HTTPS (excepto en `localhost`).

## Instalar en teléfonos

En Android/Chrome se usa **Instalar**. En iPhone/iPad: Safari → **Compartir** → **Agregar a pantalla de inicio**. Requiere HTTPS.

## Dashboard

La bandeja de pagos permite aprobar pagos pendientes de forma individual o en lote. La firma del validador la pone la base de datos con el usuario en sesión. La exportación `.xlsx` respeta los filtros y permite elegir columnas.
