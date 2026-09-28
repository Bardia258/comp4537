class Note {
  constructor(app, text = USER_MESSAGES.emptyNote) {
    this.app = app;

    this.wrapper = document.createElement("div");
    this.wrapper.className = "note-row";

    this.textArea = document.createElement("textarea");
    this.textArea.className = "note-text";
    this.textArea.value = text;
    this.textArea.setAttribute("aria-label", USER_MESSAGES.noteLabel);

    this.removeButton = document.createElement("button");
    this.removeButton.className = "remove-button";
    this.removeButton.type = "button";
    this.removeButton.textContent = USER_MESSAGES.remove;

    this.wrapper.append(this.textArea, this.removeButton);
    this.app.notesContainer.appendChild(this.wrapper);

    this.removeButton.addEventListener("click", () => this.remove());
  }

  getData() {
    return {
      text: this.textArea.value
    };
  }

  remove() {
    const index = this.app.notes.indexOf(this);

    if (index !== -1) {
      this.app.notes.splice(index, 1);
    }

    this.wrapper.remove();
    this.app.saveNotes();
  }
}


class WriterApp {
  constructor() {
    this.notesContainer = document.getElementById("notes");
    this.addButton = document.getElementById("add-note");
    this.status = document.getElementById("status");
    this.backLink = document.getElementById("back-link");

    this.notes = [];

    this.addButton.textContent = USER_MESSAGES.add;
    this.backLink.textContent = USER_MESSAGES.back;

    this.addButton.addEventListener("click", () => this.addNote());

    this.loadNotes();
    this.saveNotes();

    const saveIntervalMilliseconds = 2000;
    setInterval(() => this.saveNotes(), saveIntervalMilliseconds);
  }

  addNote(text = USER_MESSAGES.emptyNote) {
    const note = new Note(this, text);
    this.notes.push(note);
  }

  saveNotes() {
    const noteData = this.notes.map((note) => note.getData());

    const serializedNotes = JSON.stringify(noteData);

    localStorage.setItem(
      USER_MESSAGES.storageKey,
      serializedNotes
    );

    this.status.textContent =
      `${USER_MESSAGES.storedAt}${this.getCurrentTime()}`;
  }

  loadNotes() {
    const storedNotes =
      localStorage.getItem(USER_MESSAGES.storageKey);

    if (storedNotes === null) {
      return;
    }

    try {
      const parsedNotes = JSON.parse(storedNotes);

      if (!Array.isArray(parsedNotes)) {
        return;
      }

      parsedNotes.forEach((note) => {
        const text =
          typeof note.text === "string"
            ? note.text
            : USER_MESSAGES.emptyNote;

        this.addNote(text);
      });
    } catch (error) {
      localStorage.removeItem(USER_MESSAGES.storageKey);
    }
  }

  getCurrentTime() {
    return new Date().toLocaleTimeString();
  }
}


new WriterApp();