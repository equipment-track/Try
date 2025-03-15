function setReminder() {
    let title = document.getElementById("title").value;
    let message = document.getElementById("message").value;
    let time = new Date(document.getElementById("reminderTime").value).getTime();

    if (!title || !message || !time) {
        alert("Please fill all fields.");
        return;
    }

    let reminder = { title, message, time };

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(reg => {
            reg.active.postMessage(reminder);
        });
    }

    alert("Reminder set successfully!");
}