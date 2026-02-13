// PWA Service Worker Registration
declare const self: ServiceWorkerGlobalScope & {
  readonly clients: Clients;
  readonly registration: ServiceWorkerRegistration;
};

export {};

// Register service worker
export async function registerSW() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              window.dispatchEvent(new CustomEvent('sw-update-available'));
            }
          });
        }
      });

      // Listen for controlling change
      registration.addEventListener('controllerchange', () => {
        window.location.reload();
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
}

// Unregister service worker
export async function unregisterSW() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.unregister();
      }
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
    }
  }
}

// Listen for SW updates and show prompt
let deferredPrompt: Event | null = null;

export function setupInstallPrompt() {
  if (typeof window === 'undefined') return;

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPrompt = e;
    window.dispatchEvent(new CustomEvent('sw-install-prompt-available'));
  });

  window.addEventListener('sw-update-available', () => {
    // Show notification that update is available
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Actualización disponible', {
        body: 'Una nueva versión de mIAutoescuela está disponible.',
        icon: '/icon-192.png',
      });
    }
  });
}

export function promptInstall(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (!deferredPrompt) {
      resolve(false);
      return;
    }

    (deferredPrompt as Event & { prompt(): void; userChoice: Promise<{ outcome: string }> }).prompt();
    (deferredPrompt as Event & { prompt(): void; userChoice: Promise<{ outcome: string }> }).userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        resolve(true);
      } else {
        resolve(false);
      }
      deferredPrompt = null;
    }).catch(reject);
  });
}

export function isInstallPromptAvailable(): boolean {
  return deferredPrompt !== null;
}

export function isPWAInstalled(): boolean {
  if (typeof window === 'undefined') return false;

  // Check if running as standalone PWA
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone: boolean }).standalone === true
  );
}
