document.getElementById("saveNoteButton").addEventListener("click", saveNote);
document.getElementById("search").addEventListener("input", searchNotes);

function saveNote() {
    const noteText = document.getElementById("noteInput").value;
    const reminderText = detectDateTime(noteText);

    if (noteText) {
        const note = {
            text: noteText,
            reminder: reminderText,
            reminderTime: reminderText ? getReminderTime(reminderText) : null,
        };

        let notes = JSON.parse(localStorage.getItem("notes")) || [];
        notes.push(note);
        localStorage.setItem("notes", JSON.stringify(notes));

        displayNotes();

        if (reminderText) {
            const userConfirmed = confirm(`Date and time detected: ${reminderText}. Would you like to set a reminder?`);
            if (userConfirmed && note.reminderTime) {
                scheduleNotification(note.reminderTime, note.text);
            }
        }

        document.getElementById("noteInput").value = ''; // Clear input field after saving
    }
}

function detectDateTime(text) {
    const dateTimeRegex = /\b(\d{1,2}(st|nd|rd|th)?\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*(at)?\s*(\d{1,2}(:\d{2})?\s*(am|pm))?)\b|\b(tomorrow|next\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/gi;
    const matches = text.match(dateTimeRegex);
    return matches ? matches[0] : null;
}

function displayNotes() {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    const notesContainer = document.getElementById("notesContainer");

    notesContainer.innerHTML = '';
    notes.forEach((note, index) => {
        const noteDiv = document.createElement('div');
        noteDiv.classList.add('note');
        noteDiv.innerHTML = `
            <p><strong>Note:</strong> ${note.text}</p>
            <p><strong>Reminder:</strong> ${note.reminder || 'None'}</p>
            <p><strong>Time:</strong> ${note.reminderTime || 'None'}</p>
        `;
        notesContainer.appendChild(noteDiv);
    });
}

function getReminderTime(reminderText) {
    const datePattern = /(\d{1,2})(st|nd|rd|th)?\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*(at)?\s*(\d{1,2})(:\d{2})?\s*(am|pm)?/i;
    const relativePattern = /(tomorrow|next\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday))/i;

    const dateMatch = reminderText.match(datePattern);
    const relativeMatch = reminderText.match(relativePattern);

    if (dateMatch) {
        const [_, day, , month, , hour, minute, period] = dateMatch;
        const monthNumber = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(month.toLowerCase());
        const date = new Date();
        date.setMonth(monthNumber);
        date.setDate(day);
        date.setHours(hour % 12 + (period.toLowerCase() === 'pm' ? 12 : 0), minute ? minute.slice(1) : 0, 0, 0);

        return date.toISOString();
    } else if (relativeMatch) {
        const [relativeDay, nextDay] = relativeMatch;
        const date = new Date();
        if (relativeDay.toLowerCase() === 'tomorrow') {
            date.setDate(date.getDate() + 1);
        } else if (nextDay) {
            const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const today = date.getDay();
            const nextDayIndex = dayOfWeek.indexOf(nextDay.toLowerCase());
            const daysUntilNext = (nextDayIndex + 7 - today) % 7 || 7;
            date.setDate(date.getDate() + daysUntilNext);
        }

        date.setHours(9, 0, 0, 0); // Default to 9 AM if no time is specified
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

function searchNotes() {
    const query = document.getElementById('search').value.toLowerCase();
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    const filteredNotes = notes.filter(note => note.text.toLowerCase().includes(query));
    displayFilteredNotes(filteredNotes);
}

function displayFilteredNotes(notes) {
    const notesContainer = document.getElementById("notesContainer");
    notesContainer.innerHTML = '';
    notes.forEach(note => {
        const noteDiv = document.createElement('div');
        noteDiv.classList.add('note');
        noteDiv.innerHTML = `
            <p><strong>Note:</strong> ${note.text}</p>
            <p><strong>Reminder:</strong> ${note.reminder || 'None'}</p>
            <p><strong>Time:</strong> ${note.reminderTime || 'None'}</p>
        `;
        notesContainer.appendChild(noteDiv);
    });
}

document.addEventListener("DOMContentLoaded", displayNotes);