self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow("https://equipment-track.github.io/Try/") // Change this to your page
    );
});