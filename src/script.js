let albums = [];
let listened = JSON.parse(localStorage.getItem("listened_static_v1") || "{}");

const sidebar = document.getElementById("sidebar");
const toggleSidebar = document.getElementById("toggleSidebar");
const searchInput = document.getElementById("searchInput");
const randomBtn = document.getElementById("randomBtn");
const randomAlbumDiv = document.getElementById("randomAlbum");
const notesPanel = document.getElementById("notesPanel");
const albumGrid = document.getElementById("albumGrid");
const progressFill = document.getElementById("progressFill");
const sidebarProgressFill = document.getElementById("sidebarProgressFill");

function saveListened() {
  localStorage.setItem("listened_static_v1", JSON.stringify(listened));
  updateProgress();
}

function updateProgress() {
  const pct = (Object.keys(listened).length / albums.length) * 100;
  progressFill.style.width = pct + "%";
  sidebarProgressFill.style.height = pct + "%";
}

toggleSidebar.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
});

randomBtn.addEventListener("click", pickRandom);

searchInput.addEventListener("input", () => {
  renderGrid();
});

function pickRandom() {
  const unlistened = albums.filter(a => !listened[a.id]);
  const pool = unlistened.length ? unlistened : albums;
  const album = pool[Math.floor(Math.random() * pool.length)];
  showRandomAlbum(album);
}

function showRandomAlbum(album) {
  randomAlbumDiv.classList.remove("hidden");
  randomAlbumDiv.innerHTML = `
    <img src="${album.cover !== "Unknown" ? album.cover : "https://via.placeholder.com/300"}" />
    <div>
      <h2>${album.title}</h2>
      <p>${album.artist}</p>
      <div class="tags">
        <span>${album.year}</span>
        <span>${album.genre}</span>
      </div>
    </div>
  `;

  showNotesPanel(album);
}

function showNotesPanel(album) {
  notesPanel.classList.remove("hidden");
  const existing = listened[album.id]?.notes || "";

  notesPanel.innerHTML = `
    <textarea id="notesInput">${existing}</textarea>
    <button id="saveNotes">Mark as listened</button>
  `;

  document.getElementById("saveNotes").onclick = () => {
    const notes = document.getElementById("notesInput").value;
    listened[album.id] = { notes, timestamp: new Date().toISOString() };
    saveListened();
    renderGrid();
  };
}

function renderGrid() {
  const term = searchInput.value.toLowerCase();

  const filtered = albums.filter(a =>
    `${a.title} ${a.artist}`.toLowerCase().includes(term)
  );

  albumGrid.innerHTML = filtered
    .map(
      a => `
      <div class="album-card ${listened[a.id] ? "listened" : ""}" data-id="${a.id}">
        <img src="${a.cover !== "Unknown" ? a.cover : "https://via.placeholder.com/300"}" />
        <h4>${a.title}</h4>
        <p>${a.artist}</p>
      </div>
    `
    )
    .join("");

  document.querySelectorAll(".album-card").forEach(card => {
    card.onclick = () => {
      const id = card.getAttribute("data-id");
      const album = albums.find(a => a.id == id);
      showRandomAlbum(album);
    };
  });
}

fetch("data/albums_with_genre_reason.json")
  .then(res => res.json())
  .then(data => {
    albums = data.map((a, i) => ({ id: i, ...a }));
    renderGrid();
    updateProgress();
  });
