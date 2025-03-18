if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js').then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
        }).catch((error) => {
            console.log('Service Worker registration failed:', error);
        });
    });
}

document.getElementById("saveNote").addEventListener("click", saveNote);

function saveNote() {
    const noteText = document.getElementById("noteText").value;
    const reminderText = document.getElementById("reminder").value;

    if (noteText && reminderText) {
        const note = {
            text: noteText,
            reminder: reminderText,
            reminderTime: getReminderTime(reminderText),
        };

        let notes = JSON.parse(localStorage.getItem("notes")) || [];
        notes.push(note);
        localStorage.setItem("notes", JSON.stringify(notes));

        displayNotes();
    }
}

function displayNotes() {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    const noteList = document.getElementById("noteList");

    noteList.innerHTML = '';
    notes.forEach((note, index) => {
        const noteDiv = document.createElement('div');
        noteDiv.classList.add('note');
        noteDiv.innerHTML = `
            <p><strong>Note:</strong> ${note.text}</p>
            <p><strong>Reminder:</strong> ${note.reminder}</p>
            <p><strong>Time:</strong> ${note.reminderTime}</p>
        `;
        noteList.appendChild(noteDiv);

        scheduleNotification(note.reminderTime, note.text);
    });
}

function getReminderTime(reminderText) {
    const datePattern = /(\d{1,2})\s([a-zA-Z]{3})\s(\d{1,2}):?(\d{2})?\s?(AM|PM)/;
    const matches = reminderText.match(datePattern);
    
    if (matches) {
        const [_, day, month, hour, minute, period] = matches;
        const monthNumber = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month);
        const date = new Date(2025, monthNumber, day, hour % 12 + (period.toUpperCase() === 'PM' ? 12 : 0), minute || 0);

        return date.toISOString();
    }

    return null;
}

function scheduleNotification(reminderTime, noteText) {
    const notificationTime = new Date(reminderTime).getTime() - new Date().getTime();
    if (notificationTime > 0) {
        setTimeout(() => {
            new Notification("Reminder", {
                body: `Your reminder: ${noteText}`,
            });
        }, notificationTime);
    }
}

document.addEventListener("DOMContentLoaded", displayNotes);