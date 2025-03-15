document.addEventListener("DOMContentLoaded", () => {
    if ("Notification" in window) {
        Notification.requestPermission().then(permission => {
            console.log("Notification permission:", permission);
        });
    } else {
        alert("Your browser does not support notifications.");
    }
});

document.getElementById("notifyBtn").addEventListener("click", () => {
    if (Notification.permission === "granted") {
        new Notification("Test Notification", {
            body: "This is a test notification!",
            icon: "icon-192x192.png"
        });
    } else {
        alert("Please allow notifications in your browser settings.");
    }
});