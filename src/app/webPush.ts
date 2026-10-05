const decodeVapidKey = (value: string) => {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
};

export async function subscribeToPushNotifications() {
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Este navegador no admite notificaciones push.');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Debes permitir las notificaciones en el navegador.');

  const token = localStorage.getItem('token');
  if (!token) throw new Error('Inicia sesión para activar las notificaciones.');

  const keyResponse = await fetch('/api/notifications/key');
  const keyResult = await keyResponse.json();
  if (!keyResponse.ok || !keyResult.publicKey) throw new Error(keyResult.error || 'No se pudo obtener la clave de notificaciones.');

  const registration = await navigator.serviceWorker.ready;
  const applicationServerKey = decodeVapidKey(keyResult.publicKey);
  let subscription = await registration.pushManager.getSubscription();
  const existingKey = subscription?.options.applicationServerKey;
  const existingKeyMatches = existingKey && new Uint8Array(existingKey).every((byte, index) => byte === applicationServerKey[index])
    && new Uint8Array(existingKey).length === applicationServerKey.length;

  if (subscription && !existingKeyMatches) {
    await subscription.unsubscribe();
    subscription = null;
  }

  if (!subscription) {
    try {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
    } catch (error) {
      const detail = error instanceof Error ? ` (${error.message})` : '';
      throw new Error(`El navegador rechazó la suscripción push. Revisa que la clave pública y la privada configuradas en Vercel sean el mismo par y vuelve a intentar.${detail}`);
    }
  }

  const response = await fetch('/api/notifications/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(subscription),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'No se pudo guardar la suscripción.');

  return permission;
}