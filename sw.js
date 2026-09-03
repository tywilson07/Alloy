// Alloy Service Worker
const CACHE = 'alloy-v1';
self.addEventListener('install', e => {
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

// Push notifications (coach<->athlete messages) — the actual send happens server-side
// (a Supabase Edge Function), this just displays whatever payload it sent.
self.addEventListener('push', e => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch (err) {}
  const title = data.title || 'Alloy';
  const body = data.body || 'You have a new message';
  e.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: data.url || '/' },
    })
  );
});

// Tapping a notification focuses an already-open Alloy window if there is one,
// instead of always opening a new tab/window on top of it.
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windows => {
      for (const w of windows) {
        if ('focus' in w) return w.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
