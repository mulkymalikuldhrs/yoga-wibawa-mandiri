// ============================================================
// PWA Registration & Utilities for YWM Dashboard
// Updated: 2026-05-29 — Enhanced push notification support
// registerSW(), unregisterSW(), isPWAInstalled(), showInstallPrompt()
// requestPushPermission(), getPushSubscription()
// ============================================================

// Store the beforeinstallprompt event for later use
let deferredPrompt: BeforeInstallPromptEvent | null = null;

// Custom event for PWA install prompt
export const onInstallPromptAvailable = (callback: (e: BeforeInstallPromptEvent) => void) => {
  if (deferredPrompt) {
    callback(deferredPrompt);
    return;
  }

  const handler = (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    callback(deferredPrompt);
  };

  window.addEventListener('beforeinstallprompt', handler);
  return () => window.removeEventListener('beforeinstallprompt', handler);
};

// BeforeInstallPromptEvent type (not standard in TypeScript)
export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Register the service worker
 */
export function registerSW(): void {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) {
    console.warn('[YWM PWA] Service Worker not supported');
    return;
  }

  window.addEventListener('load', async () => {
    try {
      const swUrl = '/sw.js';
      const registration = await navigator.serviceWorker.register(swUrl, {
        scope: '/',
      });

      console.log('[YWM PWA] Service Worker registered:', registration.scope);

      // Check for updates periodically
      setInterval(() => {
        registration.update().catch((err) => {
          console.warn('[YWM PWA] SW update check failed:', err);
        });
      }, 60 * 60 * 1000); // Check every hour

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content available — notify user
              console.log('[YWM PWA] Konten baru tersedia, silakan refresh.');
              // Send message to skip waiting
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            } else {
              console.log('[YWM PWA] Konten di-cache untuk penggunaan offline.');
            }
          }
        });
      });
    } catch (error) {
      console.error('[YWM PWA] Service Worker registration failed:', error);
    }
  });

  // Listen for controller change (new SW activated)
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  // Listen for beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    console.log('[YWM PWA] Install prompt captured');
  });

  // Listen for appinstalled event
  window.addEventListener('appinstalled', () => {
    console.log('[YWM PWA] App installed successfully');
    deferredPrompt = null;
  });
}

/**
 * Unregister the service worker
 */
export async function unregisterSW(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.unregister();
    console.log('[YWM PWA] Service Worker unregistered');
  } catch (error) {
    console.error('[YWM PWA] Failed to unregister SW:', error);
  }
}

/**
 * Check if the app is running as an installed PWA
 */
export function isPWAInstalled(): boolean {
  if (typeof window === 'undefined') return false;

  // Check if displayed in standalone mode
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  // Check iOS Safari PWA
  const isIOSStandalone = (navigator as any).standalone === true;

  return isStandalone || isIOSStandalone;
}

/**
 * Show the install prompt if available
 * Returns true if the prompt was shown, false otherwise
 */
export async function showInstallPrompt(): Promise<boolean> {
  if (!deferredPrompt) {
    console.log('[YWM PWA] No install prompt available');
    return false;
  }

  try {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[YWM PWA] Install prompt outcome:', outcome);
    deferredPrompt = null;
    return outcome === 'accepted';
  } catch (error) {
    console.error('[YWM PWA] Install prompt error:', error);
    return false;
  }
}

/**
 * Check if install prompt is available
 */
export function canInstallPWA(): boolean {
  return deferredPrompt !== null;
}

/**
 * Get the deferred prompt (for component use)
 */
export function getDeferredPrompt(): BeforeInstallPromptEvent | null {
  return deferredPrompt;
}

// ── Push Notification Functions ──

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'PushManager' in window && 'serviceWorker' in navigator;
}

/**
 * Request push notification permission
 * Returns the permission status: 'granted', 'denied', or 'default'
 */
export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    console.warn('[YWM PWA] Push notifications not supported');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  console.log('[YWM PWA] Push permission:', permission);
  return permission;
}

/**
 * Get the current push subscription
 * Returns the subscription object or null
 */
export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription;
  } catch (error) {
    console.error('[YWM PWA] Failed to get push subscription:', error);
    return null;
  }
}

/**
 * Subscribe to push notifications
 * Requires a VAPID public key (to be configured on server)
 * Returns the subscription object or null on failure
 */
export async function subscribeToPush(vapidPublicKey: string): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;

  try {
    const permission = await requestPushPermission();
    if (permission !== 'granted') {
      console.warn('[YWM PWA] Push permission not granted');
      return null;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey,
    });

    console.log('[YWM PWA] Push subscription created:', subscription.endpoint);
    // In a real implementation, you would send the subscription to your server
    return subscription;
  } catch (error) {
    console.error('[YWM PWA] Failed to subscribe to push:', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const subscription = await getPushSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      console.log('[YWM PWA] Push subscription removed');
      return true;
    }
    return false;
  } catch (error) {
    console.error('[YWM PWA] Failed to unsubscribe from push:', error);
    return false;
  }
}

/**
 * Check the current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}
