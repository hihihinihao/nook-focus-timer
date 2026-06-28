// ============================================================
// Desktop notifications — pure functions, zero framework imports.
// Uses the browser Notification API.
// ============================================================

const PERMISSION_KEY = 'nook_notify_permission';

/**
 * Request notification permission. Only call on user gesture (e.g., Start click).
 * Returns true if granted.
 */
export async function requestPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;

  // Already granted
  if (Notification.permission === 'granted') return true;

  // Already denied — don't ask again
  if (Notification.permission === 'denied') return false;

  try {
    const result = await Notification.requestPermission();
    const granted = result === 'granted';
    try { localStorage.setItem(PERMISSION_KEY, result); } catch { /* noop */ }
    return granted;
  } catch {
    return false;
  }
}

/** Check if notifications are currently granted */
export function isGranted(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

/** Send a desktop notification. Silently ignores errors. */
export function notify(title: string, body: string): void {
  if (!isGranted()) return;
  try {
    new Notification(title, {
      body,
      icon: '/favicon.svg',
      tag: 'nook-timer',
    });
  } catch {
    // Notification constructor may throw in some environments
  }
}
