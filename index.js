// Function to parse the input text for dates and times
function extractDateAndTime(noteText) {
    // Regex for detecting date (e.g., 03 Feb, next Monday, tomorrow)
    const dateRegex = /(\d{1,2})\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*(\d{4})?/i;
    const timeRegex = /(\d{1,2})([.,]?\d{1,2})?\s?(AM|PM|am|pm)/i;

    const dateMatch = noteText.match(dateRegex);
    const timeMatch = noteText.match(timeRegex);

    let detectedDate = null;
    let detectedTime = null;

    // If date is detected
    if (dateMatch) {
        const day = parseInt(dateMatch[1], 10);
        const month = dateMatch[2].toLowerCase();
        const year = dateMatch[3] ? parseInt(dateMatch[3], 10) : 2025;

        // Convert month abbreviation to month number
        const monthMap = {
            jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
            jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
        };
        
        detectedDate = new Date(year, monthMap[month], day);
    }

    // If time is detected (either with or without minutes)
    if (timeMatch) {
        let hours = parseInt(timeMatch[1], 10);
        let minutes = timeMatch[2] ? parseInt(timeMatch[2].replace('.', ':'), 10) : 0;
        let period = timeMatch[3].toUpperCase();

        // If PM and hour is less than 12, convert to 24-hour format
        if (period === "PM" && hours < 12) {
            hours += 12;
        }

        // If AM and hour is 12, convert to 0-hour format (midnight)
        if (period === "AM" && hours === 12) {
            hours = 0;
        }

        detectedTime = { hours, minutes };
    }

    // If no time is detected, default to 5:50 AM
    if (!detectedTime) {
        detectedTime = { hours: 5, minutes: 50 };
    }

    return { detectedDate, detectedTime };
}

// Function to save the note and set a reminder
function saveNote() {
    const noteText = document.getElementById("noteInput").value;
    const { detectedDate, detectedTime } = extractDateAndTime(noteText);

    if (detectedDate) {
        const reminderTime = new Date(detectedDate.setHours(detectedTime.hours, detectedTime.minutes));

        // Ask the user if they want to set a reminder
        if (confirm(`You mentioned ${detectedDate.toLocaleDateString()} at ${detectedTime.hours}:${detectedTime.minutes < 10 ? '0' + detectedTime.minutes : detectedTime.minutes}. Do you want to set a reminder?`)) {
            // Save to localStorage (or any storage solution)
            const notes = JSON.parse(localStorage.getItem('notes')) || [];
            notes.push({ noteText, reminderTime });
            localStorage.setItem('notes', JSON.stringify(notes));

            alert("Reminder set!");

            // Update the UI to show saved notes with reminders
            displayNotes();
        }
    }
}

// Function to display the saved notes
function displayNotes() {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const noteList = document.getElementById('noteList');
    noteList.innerHTML = ""; // Clear current list

    notes.forEach((note, index) => {
        const noteItem = document.createElement('div');
        noteItem.classList.add('note');
        const formattedDate = note.reminderTime.toLocaleString();
        noteItem.innerHTML = `<strong>Note ${index + 1}:</strong> ${note.noteText} - Reminder set for: ${formattedDate}`;
        noteList.appendChild(noteItem);
    });
}

// Display notes on page load
document.addEventListener('DOMContentLoaded', displayNotes);