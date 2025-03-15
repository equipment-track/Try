// Register Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
        console.log('Service Worker registered with scope:', registration.scope);
        document.getElementById('status').textContent = 'Service Worker Registered!';
    }).catch(function(error) {
        console.error('Service Worker registration failed:', error);
        document.getElementById('status').textContent = 'Service Worker registration failed!';
    });
}

// Request Notification Permission
if ('Notification' in window) {
    Notification.requestPermission().then(function(permission) {
        if (permission === 'granted') {
            console.log('Notification permission granted.');
            document.getElementById('status').textContent = 'Notification permission granted!';
        } else {
            console.log('Notification permission denied.');
            document.getElementById('status').textContent = 'Notification permission denied!';
        }
    });
}

// Test Notification button
document.getElementById('testNotification').addEventListener('click', function() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(function(registration) {
            registration.showNotification("Test Notification", {
                body: "This is a test notification triggered by the button click.",
                icon: '/icon-192x192.png',
                badge: '/icon-192x192.png',
            });
        }).catch(function(error) {
            console.error('Error showing notification:', error);
        });
    }
});