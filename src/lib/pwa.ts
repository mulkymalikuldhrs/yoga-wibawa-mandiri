// ============================================================
// PWA Registration & Utilities for YWM Dashboard
// Updated: 2026-03-04 — v3: Fixed double listener, added update notifications
// Exports: registerSW(), unregisterSW(), isPWAInstalled(), showInstallPrompt()
//          onInstallPromptAvailable(), onSWUpdateAvailable()
//          requestPushPermission(), getPushSubscription()
// ============================================================

// Store the beforeinstallprompt event for later use
let deferredPrompt: BeforeInstallPromptEvent | null = null;

// Update callback subscribers
type UpdateCallback = (registration: ServiceWorkerRegistration) => void;
const updateSubscribers: Set<UpdateCallback> = new Set();

// BeforeInstallPromptEvent type (not standard in TypeScript)
export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// ─── Install Prompt Management ─────────────────────────────

/**
 * Subscribe to be notified when the install prompt becomes available.
 * If the prompt was already captured, the callback fires immediately.
 * Returns an unsubscribe function.
 */
export const onInstallPromptAvailable = (callback: (e: BeforeInstallPromptEvent) => void) => {
  // If we already have the prompt, fire immediately
  if (deferredPrompt) {
    callback(deferredPrompt);
    return () => {};
  }

  const handler = (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    callback(deferredPrompt);
  };

  window.addEventListener('beforeinstallprompt', handler);
  return () => window.removeEventListener('beforeinstallprompt', handler);
};

/**
 * Subscribe to be notified when a new service worker update is available.
 * Returns an unsubscribe function.
 */
export const onSWUpdateAvailable = (callback: UpdateCallback) => {
  updateSubscribers.add(callback);
  return () => updateSubscribers.delete(callback);
};

// ─── Service Worker Registration ────────────────────────────

/**
 * Register the service worker and set up lifecycle handlers.
 */
export function registerSW(): void {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) {
    if (import.meta.env.DEV) console.warn('[YWM PWA] Service Worker not supported');
    return;
  }

  // Single beforeinstallprompt listener — the canonical capture point
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    if (import.meta.env.DEV) console.log('[YWM PWA] Install prompt captured');
  });

  // Listen for appinstalled event
  window.addEventListener('appinstalled', () => {
    if (import.meta.env.DEV) console.log('[YWM PWA] App installed successfully');
    deferredPrompt = null;
  });

  window.addEventListener('load', async () => {
    try {
      const swUrl = '/sw.js';
      const registration = await navigator.serviceWorker.register(swUrl, {
        scope: '/',
      });

      if (import.meta.env.DEV) console.log('[YWM PWA] Service Worker registered:', registration.scope);

      // Check for updates periodically (every hour)
      setInterval(() => {
        registration.update().catch((err) => {
          if (import.meta.env.DEV) console.warn('[YWM PWA] SW update check failed:', err);
        });
      }, 60 * 60 * 1000);

      // Handle updates found
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content available — notify subscribers
              if (import.meta.env.DEV) console.log('[YWM PWA] New content available');
              updateSubscribers.forEach((cb) => {
                try { cb(registration); } catch (e) { /* noop */ }
              });
            } else {
              if (import.meta.env.DEV) console.log('[YWM PWA] Content cached for offline use');
            }
          }
        });
      });
    } catch (error) {
      if (import.meta.env.DEV) console.error('[YWM PWA] Service Worker registration failed:', error);
    }
  });

  // Handle controller change (new SW activated) — auto-reload once
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
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
    if (import.meta.env.DEV) console.log('[YWM PWA] Service Worker unregistered');
  } catch (error) {
    if (import.meta.env.DEV) console.error('[YWM PWA] Failed to unregister SW:', error);
  }
}

// ─── PWA Status Checks ─────────────────────────────────────

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

// ─── Install Flow ───────────────────────────────────────────

/**
 * Show the install prompt if available.
 * Returns true if the user accepted, false otherwise.
 */
export async function showInstallPrompt(): Promise<boolean> {
  if (!deferredPrompt) {
    if (import.meta.env.DEV) console.log('[YWM PWA] No install prompt available');
    return false;
  }

  try {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (import.meta.env.DEV) console.log('[YWM PWA] Install prompt outcome:', outcome);
    deferredPrompt = null;
    return outcome === 'accepted';
  } catch (error) {
    if (import.meta.env.DEV) console.error('[YWM PWA] Install prompt error:', error);
    return false;
  }
}

// ─── Push Notification Functions ────────────────────────────

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'PushManager' in window && 'serviceWorker' in navigator;
}

/**
 * Request push notification permission
 */
export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    if (import.meta.env.DEV) console.warn('[YWM PWA] Push notifications not supported');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  if (import.meta.env.DEV) console.log('[YWM PWA] Push permission:', permission);
  return permission;
}

/**
 * Get the current push subscription
 */
export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription;
  } catch (error) {
    if (import.meta.env.DEV) console.error('[YWM PWA] Failed to get push subscription:', error);
    return null;
  }
}

/**
 * Subscribe to push notifications with a VAPID public key
 */
export async function subscribeToPush(vapidPublicKey: string): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;

  try {
    const permission = await requestPushPermission();
    if (permission !== 'granted') {
      if (import.meta.env.DEV) console.warn('[YWM PWA] Push permission not granted');
      return null;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey,
    });

    if (import.meta.env.DEV) console.log('[YWM PWA] Push subscription created:', subscription.endpoint);
    return subscription;
  } catch (error) {
    if (import.meta.env.DEV) console.error('[YWM PWA] Failed to subscribe to push:', error);
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
      if (import.meta.env.DEV) console.log('[YWM PWA] Push subscription removed');
      return true;
    }
    return false;
  } catch (error) {
    if (import.meta.env.DEV) console.error('[YWM PWA] Failed to unsubscribe from push:', error);
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
