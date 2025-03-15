self.addEventListener('message', event => {
    const reminder = event.data;
    if (reminder) {
        saveReminder(reminder);
        scheduleNotification(reminder);
    }
});

// Save reminder in IndexedDB
function saveReminder(reminder) {
    const dbRequest = indexedDB.open("RemindersDB", 1);

    dbRequest.onupgradeneeded = event => {
        let db = event.target.result;
        if (!db.objectStoreNames.contains("reminders")) {
            db.createObjectStore("reminders", { keyPath: "time" });
        }
    };

    dbRequest.onsuccess = event => {
        let db = event.target.result;
        let tx = db.transaction("reminders", "readwrite");
        let store = tx.objectStore("reminders");
        store.put(reminder);
        tx.oncomplete = () => console.log("Reminder Saved!");
    };
}

// Schedule notification
function scheduleNotification(reminder) {
    let now = Date.now();
    let delay = reminder.time - now;

    if (delay > 0) {
        setTimeout(() => {
            self.registration.showNotification(reminder.title, {
                body: reminder.message,
                icon: "icon.png",
                vibrate: [200, 100, 200],
            });
        }, delay);
    }
}