const readClipboardBtn = document.getElementById("readClipboard");
const clearAllBtn = document.getElementById("clearAll");
const clipboardList = document.getElementById("clipboardList");
const searchInput = document.getElementById("searchInput");
//
const modal = document.getElementById("modal");
const modalText = document.getElementById("modalText");
const closeModal = document.getElementById("closeModal");

let entries = [];

function saveToLocalStorage() {
  localStorage.setItem("clipboardEntries", JSON.stringify(entries));
}

function loadFromLocalStorage() {
  const stored = localStorage.getItem("clipboardEntries");
  if (stored) {
    entries = JSON.parse(stored);
  }
}

function truncateText(text, maxLength = 45) {
  return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
}

function formatTimestamp(ts) {
  const d = new Date(ts);
  return d.toLocaleString(); // oder z. B. .toLocaleString('de-DE')
}

// Modal Container
function showModal(text) {
  modalText.textContent = text;
  modal.classList.remove("hidden");
}

closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});
// Modal Container

function renderList(filter = "") {
  clipboardList.innerHTML = "";

  entries
    .filter((e) => e.text.toLowerCase().includes(filter.toLowerCase()))
    .forEach((entry, index) => {
      const li = document.createElement("li");

      // Gekürzter Inhalt
      const content = document.createElement("div");
      content.textContent = truncateText(entry.text);

      const value = entry.text;
      const isTruncated = value.length > 45;
      content.textContent = truncateText(value);
      li.appendChild(content);

      if (isTruncated) {
        const moreBtn = document.createElement("button");
        moreBtn.textContent = "Mehr anzeigen";
        moreBtn.style.alignSelf = "flex-start";
        moreBtn.style.background = "transparent";
        moreBtn.style.border = "none";
        moreBtn.style.color = "#0077cc";
        moreBtn.style.cursor = "pointer";
        moreBtn.style.fontSize = "0.85em";
        moreBtn.classList.add("more-button");
        moreBtn.onclick = () => showModal(value);
        li.appendChild(moreBtn);
      }

      li.appendChild(content);

      // Zeitstempel darunter
      const time = document.createElement("small");
      time.textContent = formatTimestamp(entry.timestamp);
      time.style.display = "block";
      time.style.color = "#666";
      time.style.fontSize = "0.8em";
      li.appendChild(time);

      // Löschen-Button
      const delBtn = document.createElement("button");
      //   delBtn.textContent = "✕";
      //   delBtn.innerHTML = "&times;";
      delBtn.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#900" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
`;
      delBtn.onclick = () => {
        entries.splice(index, 1);
        saveToLocalStorage();
        renderList(searchInput.value);
      };

      li.appendChild(delBtn);
      clipboardList.appendChild(li);
    });
}

readClipboardBtn.addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text && !entries.some((e) => e.text === text)) {
      entries.unshift({ text, timestamp: Date.now() });
      saveToLocalStorage();
      renderList(searchInput.value);
    }
  } catch (err) {
    alert("Zugriff auf die Zwischenablage fehlgeschlagen.");
  }
});

clearAllBtn.addEventListener("click", () => {
  if (confirm("Wirklich alle Einträge löschen?")) {
    entries = [];
    saveToLocalStorage();
    renderList();
  }
});

searchInput.addEventListener("input", () => {
  renderList(searchInput.value);
});

// Initialisierung
loadFromLocalStorage();
renderList();
