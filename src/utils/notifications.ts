// Browser Web Push & System Notification Helper

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

export function sendPushNotification(title: string, body: string, icon: string = '/pwa-192.png') {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }
  try {
    const notification = new Notification(title, {
      body,
      icon,
      badge: icon,
      tag: 'buffet-order-status',
    } as NotificationOptions);
    
    notification.onclick = function() {
      window.focus();
      notification.close();
    };
  } catch (err) {
    console.warn('Could not display push notification:', err);
  }
}
