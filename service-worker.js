self.addEventListener('push', function(event) {
    const options = {
        body: event.data.text(),
        icon: 'icon-192x192.png', // Ensure you have an icon at this location
        badge: 'icon-192x192.png',
    };

    // Show notification
    event.waitUntil(
        self.registration.showNotification('Push Notification Title', options)
    );
});