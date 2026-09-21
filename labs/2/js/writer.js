(() => {
  const notesContainer = document.getElementById("notes");
  const addButton = document.getElementById("add-note");
  const status = document.getElementById("status");
  const backLink = document.getElementById("back-link");
  const noteObjects = [];

  class Note {
    constructor(text = USER_MESSAGES.emptyNote) {
      this.wrapper = document.createElement("div");
      this.wrapper.className = "note-row";

      this.textArea = document.createElement("textarea");
      this.textArea.className = "note-text";
      this.textArea.value = text;
      this.textArea.setAttribute("aria-label", "Note");

      this.removeButton = document.createElement("button");
      this.removeButton.className = "remove-button";
      this.removeButton.type = "button";
      this.removeButton.textContent = USER_MESSAGES.remove;

      this.wrapper.append(this.textArea, this.removeButton);
      notesContainer.appendChild(this.wrapper);

      this.removeButton.addEventListener("click", () => this.remove());
    }

    getData() {
      return { text: this.textArea.value };
    }

    remove() {
      const index = noteObjects.indexOf(this);
      if (index !== -1) {
        noteObjects.splice(index, 1);
      }
      this.wrapper.remove();
      saveNotes();
    }
  }

  const formatTime = () => new Date().toLocaleTimeString();

  const saveNotes = () => {
    const serializedNotes = JSON.stringify(noteObjects.map((note) => note.getData()));
    localStorage.setItem(USER_MESSAGES.storageKey, serializedNotes);
    status.textContent = `${USER_MESSAGES.storedAt}${formatTime()}`;
  };

  const addNote = (text = USER_MESSAGES.emptyNote) => {
    noteObjects.push(new Note(text));
  };

  const loadNotes = () => {
    const storedNotes = localStorage.getItem(USER_MESSAGES.storageKey);
    if (storedNotes === null) {
      return;
    }

    try {
      const parsedNotes = JSON.parse(storedNotes);
      if (Array.isArray(parsedNotes)) {
        parsedNotes.forEach((note) => addNote(typeof note.text === "string" ? note.text : USER_MESSAGES.emptyNote));
      }
    } catch (error) {
      localStorage.removeItem(USER_MESSAGES.storageKey);
    }
  };

  addButton.textContent = USER_MESSAGES.add;
  backLink.textContent = USER_MESSAGES.back;
  addButton.addEventListener("click", () => addNote());

  loadNotes();
  saveNotes();
  setInterval(saveNotes, 2000);
})();
