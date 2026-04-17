const CACHE_NAME = 'quizko-elms-v3';
const PRECACHE_URLS = [
    './',
    'index.html',
    'login.html',
    'admin-dashboard.html',
    'teacher-dashboard.html',
    'student-dashboard.html',
    'offline.html',
    'manifest.webmanifest',
    'css/global.css',
    'js/app-shell.js',
    'js/data.js',
    'js/firebase-db.js',
    'js/dashboard-nav.js',
    'assets/quizko-icon.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => Promise.all(
            cacheNames.map((cacheName) => {
                if (cacheName !== CACHE_NAME) {
                    return caches.delete(cacheName);
                }
                return null;
            })
        ))
    );
    self.clients.claim();
});

async function networkFirst(request) {
    const cache = await caches.open(CACHE_NAME);

    try {
        const response = await fetch(request);
        if (response && response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (request.method !== 'GET') {
        return;
    }

    if (request.mode === 'navigate') {
        event.respondWith(
            networkFirst(request).catch(async () => {
                const cache = await caches.open(CACHE_NAME);
                return cache.match('offline.html');
            })
        );
        return;
    }

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(request).then((response) => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    if (response.ok) {
                        cache.put(request, copy);
                    }
                });
                return response;
            }).catch(async () => {
                if (request.destination === 'document') {
                    const cache = await caches.open(CACHE_NAME);
                    return cache.match('offline.html');
                }
                return new Response('', { status: 504, statusText: 'Offline' });
            });
        })
    );
});
