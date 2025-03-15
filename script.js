if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
    .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch((error) => {
        console.log('Service Worker registration failed:', error);
    });
}

function askNotificationPermission() {
    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            console.log("Notification permission granted.");
        } else {
            console.log("Notification permission denied.");
        }
    });
}

document.getElementById('notifyButton').addEventListener('click', () => {
    askNotificationPermission();
    
    // After permission granted, manually trigger a test notification
    setTimeout(() => {
        if (Notification.permission === 'granted') {
            navigator.serviceWorker.ready.then((swRegistration) => {
                swRegistration.showNotification("Hello from Service Worker!", {
                    body: "This is a test notification.",
                    icon: '/icon.png'
                });
            });
        }
    }, 1000);  // Wait for 1 second to ensure permission is granted before triggering notification
});