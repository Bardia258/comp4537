class ReadOnlyNote {
  constructor(container, text) {
    this.textArea = document.createElement("textarea");
    this.textArea.className = "note-text reader-note";
    this.textArea.value = text;
    this.textArea.readOnly = true;
    this.textArea.setAttribute(
      "aria-label",
      USER_MESSAGES.storedNoteLabel
    );

    container.appendChild(this.textArea);
  }

  removeFromDom() {
    this.textArea.remove();
  }
}

class ReaderApp {
  constructor() {
    this.notesContainer = document.getElementById("notes");
    this.status = document.getElementById("status");
    this.backLink = document.getElementById("back-link");

    this.notes = [];

    this.backLink.textContent = USER_MESSAGES.back;

    this.retrieveNotes();

    const retrieveIntervalMilliseconds = 2000;

    setInterval(
      () => this.retrieveNotes(),
      retrieveIntervalMilliseconds
    );
  }

  clearNotes() {
    this.notes.forEach((note) => {
      note.removeFromDom();
    });

    this.notes.length = 0;
  }

  retrieveNotes() {
    this.clearNotes();

    const storedNotes =
      localStorage.getItem(USER_MESSAGES.storageKey);

    if (storedNotes !== null) {
      try {
        const parsedNotes = JSON.parse(storedNotes);

        if (Array.isArray(parsedNotes)) {
          parsedNotes.forEach((note) => {
            const text =
              typeof note.text === "string"
                ? note.text
                : USER_MESSAGES.emptyNote;

            const readOnlyNote =
              new ReadOnlyNote(this.notesContainer, text);

            this.notes.push(readOnlyNote);
          });
        }
      } catch (error) {
        this.clearNotes();
      }
    }

    this.status.textContent =
      `${USER_MESSAGES.updatedAt}${this.getCurrentTime()}`;
  }

  getCurrentTime() {
    return new Date().toLocaleTimeString();
  }
}

new ReaderApp();