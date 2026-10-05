# ENJ 2026

## Notificaciones push

Las alarmas del Panel de Programa se envían a los dispositivos suscritos por Web Push. El servidor requiere estas variables de entorno:

- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` (un correo de contacto con formato `mailto:...`)

Genera un par de claves una sola vez con `web-push` y conserva la clave privada solo como variable secreta del servidor:

```powershell
node -e "import('web-push').then(({ default: push }) => console.log(push.generateVAPIDKeys()))"
```

Configura las tres variables en el entorno que ejecuta `/api` (por ejemplo, Environment Variables del hosting), despliega el backend y aplica `supabase/align_payment_validation.sql` en bases de datos existentes. La tabla `public.subscriptions` debe existir; está incluida en `supabase/schema.sql`.

Cada usuario debe iniciar sesión, permitir notificaciones y activar las alertas desde el botón de campana o desde Panel de Programa. Web Push requiere HTTPS, excepto en `localhost`.

## Instalar en teléfonos

La aplicación publica su manifest y service worker desde la raíz. En Android/Chrome se usa **Instalar** y se confirma la instalación. En iPhone/iPad, abrir en Safari, tocar **Compartir** y elegir **Agregar a pantalla de inicio**. Para instalación y notificaciones push, el sitio debe servirse por HTTPS.

## Dashboard

La bandeja de pagos permite aprobar individualmente o seleccionar varios pagos pendientes. La descarga `.xlsx` respeta los filtros de búsqueda/tipo y permite escoger las columnas antes de exportar.
