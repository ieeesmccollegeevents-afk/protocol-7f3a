// Keeps the page reloadable while the laptop is offline (network first, cache fallback).
const C = 'p7f3a-v3';
self.addEventListener('install', e => e.waitUntil(caches.open(C).then(c => c.addAll(['./', './index.html'])).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;   // never touch probes / Google calls
  const cached = () => caches.match(e.request, { ignoreSearch: true }).then(m => m || caches.match('./index.html'));
  const net = fetch(e.request).then(r => { if (r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); } return r; });
  const slow = new Promise(res => setTimeout(() => res(cached()), 4000));   // connected but no internet: don't hang
  e.respondWith(Promise.race([net.catch(() => cached()), slow]).then(r => r || net));
});
