self.addEventListener('message', event => {
    if (event.data.checkReminders) {
        checkAndTriggerReminders();
    } else {
        saveReminder(event.data);
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

// Check and trigger notifications
function checkAndTriggerReminders() {
    const dbRequest = indexedDB.open("RemindersDB", 1);

    dbRequest.onsuccess = event => {
        let db = event.target.result;
        let tx = db.transaction("reminders", "readonly");
        let store = tx.objectStore("reminders");
        let request = store.getAll();

        request.onsuccess = () => {
            let now = Date.now();
            request.result.forEach(reminder => {
                if (reminder.time <= now) {
                    self.registration.showNotification(reminder.title, {
                        body: reminder.message,
                        icon: "icon.png",
                        vibrate: [200, 100, 200],
                    });
                }
            });
        };
    };
}