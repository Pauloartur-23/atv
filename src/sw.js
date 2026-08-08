import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { ExpirationPlugin } from 'workbox-expiration'

// O vite-plugin-pwa injeta o manifesto de precache aqui em tempo de build
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// ── Fallback offline para navegações não cacheadas ─────────────────────────

registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/offline.html'), {
    denylist: [/^\/api\//],
  }),
)

// ── Cache de fontes do Google ──────────────────────────────────────────────

registerRoute(
  ({ url }) => url.hostname === 'fonts.googleapis.com',
  new CacheFirst({
    cacheName: 'google-fonts-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }),
    ],
  }),
)

registerRoute(
  ({ url }) => url.hostname === 'fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'gstatic-fonts-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }),
    ],
  }),
)

// ── Cache da API — NetworkFirst ────────────────────────────────────────────

registerRoute(
  ({ url }) => url.hostname === 'localhost' && url.port === '8001',
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }),
    ],
  }),
)

// ── Lifecycle ─────────────────────────────────────────────────────────────

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// ── Recebendo push notifications ───────────────────────────────────────────

self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { event: 'unknown', message: event.data.text() }
  }

  const { title, body, icon } = buildNotificationContent(payload)

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      data: payload,
      vibrate: [200, 100, 200],
    }),
  )
})

function buildNotificationContent(payload) {
  switch (payload.event) {
    case 'task_created': {
      const task = payload.task
      let body = task?.title ?? 'Uma nova tarefa foi adicionada.'
      if (task?.priority === 'high' || task?.priority === 'alta') {
        body += ' — Prioridade: alta'
      }
      return {
        title: 'Nova tarefa criada',
        body,
        icon: '/icons/icon-notification-created.png',
      }
    }
    case 'task_updated': {
      const task = payload.task
      if (task?.done) {
        return {
          title: 'Tarefa concluída ✓',
          body: task.title,
          icon: '/icons/icon-notification-updated.png',
        }
      }
      return {
        title: 'Tarefa atualizada',
        body: task?.title ?? 'Uma tarefa foi modificada.',
        icon: '/icons/icon-notification-updated.png',
      }
    }
    case 'task_deleted': {
      const task = payload.task
      return {
        title: 'Tarefa removida',
        body: task?.title
          ? `"${task.title}" foi excluída.`
          : 'Uma tarefa foi excluída.',
        icon: '/icons/icon-notification-deleted.png',
      }
    }
    default:
      return {
        title: 'Gerenciador de Tarefas',
        body: payload.message ?? 'Você tem uma atualização.',
        icon: '/icons/icon-192x192.png',
      }
  }
}

// ── Clique na notificação ─────────────────────────────────────────────────

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            client.postMessage({
              type: 'PUSH_NOTIFICATION_CLICKED',
              payload: event.notification.data,
            })
            return client.focus()
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow('/')
        }
      }),
  )
})
