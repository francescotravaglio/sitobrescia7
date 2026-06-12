const CACHE = 'bs7-v2';
const SHELL = [
    './area-soci.html',
    './index.html',
    './logo.png',
    './favicon.svg',
    './icon-192.png',
    './icon-512.png',
];

// admin.html non va mai cachato: deve sempre arrivare fresco dalla rete
const NO_CACHE = ['admin.html', 'import-soci.html'];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    // Solo richieste GET, escludi Firebase/Google APIs
    if (e.request.method !== 'GET') return;
    const url = e.request.url;
    if (url.includes('firestore.googleapis') || url.includes('googleapis') ||
        url.includes('calendar.google') || url.includes('gstatic')) return;
    // pagine riservate: sempre dalla rete, mai dalla cache del SW
    if (NO_CACHE.some(p => url.includes(p))) return;

    e.respondWith(
        caches.match(e.request).then(cached => {
            const networkFetch = fetch(e.request).then(res => {
                if (res && res.status === 200 && res.type !== 'opaque') {
                    const clone = res.clone();
                    caches.open(CACHE).then(c => c.put(e.request, clone));
                }
                return res;
            }).catch(() => cached);
            // Network-first per HTML, cache-first per assets statici
            if (e.request.destination === 'document') return networkFetch;
            return cached || networkFetch;
        })
    );
});
