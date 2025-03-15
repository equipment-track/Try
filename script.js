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
});