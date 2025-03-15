function requestPermission() {
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            console.log("Notifications enabled.");
            registerServiceWorker();
        } else {
            console.log("Notifications denied.");
        }
    });
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log("Service Worker Registered", reg))
            .catch(err => console.error("Service Worker Failed", err));
    }
}

function sendNotification() {
    if (Notification.permission === "granted") {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification("Hello!", {
                body: "This is a local push notification!",
                icon: "icon.png",
                vibrate: [200, 100, 200],
            });
        });
    } else {
        alert("Enable notifications first.");
    }
}