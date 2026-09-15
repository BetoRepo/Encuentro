// public/sw.js
// Service Worker para Notificaciones Push en la Barra de Estado - ENJ 2026 ASV

self.addEventListener('install', (event) => {
  console.log('⚜️ ENJ 2026 Service Worker: Instalado correctamente');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('⚜️ ENJ 2026 Service Worker: Activado');
  return self.clients.claim();
});

// Listener para recibir eventos Push del servidor o llamadas locales showNotification
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { titulo: '🚨 ENJ 2026', descripcion: event.data.text() };
    }
  }

  const title = data.titulo || '🚨 ENJ 2026 • Alerta de Programa';
  const options = {
    body: data.descripcion || 'Nueva actualización o instrucción del campamento.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [300, 100, 300, 100, 500],
    tag: data.id || 'enj-alarma-tag',
    renotify: true,
    requireInteraction: true, // Mantiene la notificación visible en Android hasta ser tocada
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Evento al hacer clic en la notificación de la barra
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si la ventana ya está abierta en el navegador del teléfono, se enfoca
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no está abierta, abre una nueva ventana
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});