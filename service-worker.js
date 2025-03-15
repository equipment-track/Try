self.addEventListener('install', (event) => {
    console.log("Service Worker installing...");
    event.waitUntil(
        caches.open('my-cache').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/style.css',
                '/script.js',
                '/manifest.json',
                '/icon.png'
            ]);
        })
    );
});

self.addEventListener('activate', (event) => {
    console.log("Service Worker activated.");
});

self.addEventListener('push', (event) => {
    const options = {
        body: event.data.text(),
        icon: '/icon.png',
        badge: '/badge.png'
    };
    event.waitUntil(
        self.registration.showNotification('Push Notification', options)
    );
});