// ============================================================
// PWA Registration & Utilities for YWM Dashboard
// registerSW(), unregisterSW(), isPWAInstalled(), showInstallPrompt()
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
