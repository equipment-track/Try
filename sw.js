self.addEventListener('message', event => {
    const reminder = event.data;
    if (reminder) {
        saveReminder(reminder);
    }
});

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

// Check reminders and trigger notifications
self.addEventListener('sync', event => {
    if (event.tag === 'check-reminders') {
        event.waitUntil(checkAndTriggerReminders());
    }
});

function checkAndTriggerReminders() {
    return new Promise((resolve, reject) => {
        const dbRequest = indexedDB.open("RemindersDB", 1);
        dbRequest.onsuccess = event => {
            let db = event.target.result;
            let tx = db.transaction("reminders", "readonly");
            let store = tx.objectStore("reminders");
            let request = store.getAll();

            request.onsuccess = () => {
                let now = new Date().toISOString();
                request.result.forEach(reminder => {
                    if (reminder.time <= now) {
                        self.registration.showNotification(reminder.title, {
                            body: reminder.message,
                            icon: "icon.png",
                            vibrate: [200, 100, 200],
                        });
                    }
                });
                resolve();
            };
        };
    });
}

// Register periodic sync
self.addEventListener('install', () => {
    self.registration.periodicSync.register('check-reminders', { minInterval: 60 * 1000 });
});