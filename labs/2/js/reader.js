(() => {
  const notesContainer = document.getElementById("notes");
  const status = document.getElementById("status");
  const backLink = document.getElementById("back-link");
  const noteObjects = [];

  class ReadOnlyNote {
    constructor(text) {
      this.textArea = document.createElement("textarea");
      this.textArea.className = "note-text reader-note";
      this.textArea.value = text;
      this.textArea.readOnly = true;
      this.textArea.setAttribute("aria-label", "Stored note");
      notesContainer.appendChild(this.textArea);
    }

    removeFromDom() {
      this.textArea.remove();
    }
  }

  const formatTime = () => new Date().toLocaleTimeString();

  const clearNotes = () => {
    noteObjects.forEach((note) => note.removeFromDom());
    noteObjects.length = 0;
  };

  const retrieveNotes = () => {
    clearNotes();
    const storedNotes = localStorage.getItem(USER_MESSAGES.storageKey);

    if (storedNotes !== null) {
      try {
        const parsedNotes = JSON.parse(storedNotes);
        if (Array.isArray(parsedNotes)) {
          parsedNotes.forEach((note) => {
            const text = typeof note.text === "string" ? note.text : USER_MESSAGES.emptyNote;
            noteObjects.push(new ReadOnlyNote(text));
          });
        }
      } catch (error) {
        clearNotes();
      }
    }

    status.textContent = `${USER_MESSAGES.updatedAt}${formatTime()}`;
  };

  backLink.textContent = USER_MESSAGES.back;
  retrieveNotes();
  setInterval(retrieveNotes, 2000);
})();
