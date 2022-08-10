const CACHE_NAME = 'budget-tracker';
const DATA_CACHE_NAME = 'budget-data';

const FILES_TO_CACHE = [
    '/index.html',
    '/css/styles.css',
    '/js/index.js',
    '/icons/icon-192x192.png'
];

// install service worker
self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Service worker installed');
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// delete outdated caches
self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log('Removing old cache data', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
})

// use cache
self.addEventListener('fetch', function(e) {
    if (e.request.url.includes('/api/')) {
        e.respondWith(
            caches.open(DATA_CACHE_NAME)
                .then(cache => {
                    return fetch(e.request)
                        .then(response => {
                            if (response.status === 200) {
                                cache.put(e.request.url, response.clone());
                            }
                            return response;
                        }).catch(err => {
                            return cache.match(e.request);
                        })
                })
                .catch(err => console.log(err))
        );
        return;
    }
})