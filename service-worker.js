// Install the Service Worker and Cache the assets
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('push-notifications-cache').then(function(cache) {
            return cache.addAll([
                '/',
                '/index.html',
                '/app.js',
                '/icon-192x192.png',
                '/icon-512x512.png',
            ]);
        })
    );
});

// Activate the Service Worker
self.addEventListener('activate', function(event) {
    console.log('Service Worker activated!');
});

// Push event listener
self.addEventListener('push', function(event) {
    console.log('Push notification received:', event);

    // Set default options for notification
    let options = {
        body: event.data.text(),
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
    };

    event.waitUntil(
        self.registration.showNotification('Test Notification', options)
    );
});