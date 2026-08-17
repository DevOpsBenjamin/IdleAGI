import { registerSW } from 'virtual:pwa-register'

/**
 * Configure PWA Auto-Update with zero-prompt automatic reload.
 * When a new build is deployed on Cloudflare Pages:
 * 1. Checks periodically for new Service Worker
 * 2. Saves game state immediately before reload
 * 3. Triggers window.location.reload() transparently
 */
export function registerPwaAutoUpdate(onBeforeReload?: () => void) {
  if ('serviceWorker' in navigator) {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        console.log('[PWA] New system version detected. Performing pre-update save and reloading...')
        if (onBeforeReload) {
          try {
            onBeforeReload()
          } catch (e) {
            console.error('[PWA] Error during pre-reload save:', e)
          }
        }
        // Apply the new service worker immediately & reload
        updateSW(true)
      },
      onOfflineReady() {
        console.log('[PWA] App is offline-ready and fully cached.')
      },
      onRegistered(registration) {
        if (registration) {
          // Check for updates every 5 minutes
          setInterval(() => {
            registration.update()
          }, 5 * 60 * 1000)
        }
      },
    })
  }
}
