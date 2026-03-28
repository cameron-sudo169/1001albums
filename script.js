let albums = [];
let filteredAlbums = [];
let currentAlbum = null;
let listenedMap = {};

const randomAlbumCard = document.getElementById('randomAlbumCard');
const albumGrid = document.getElementById('albumGrid');
const notesTextarea = document.getElementById('notesTextarea');
const markListenedBtn = document.getElementById('markListenedBtn');
const pickRandomBtn = document.getElementById('pickRandomBtn');
const resetBtn = document.getElementById('resetBtn');
const searchInput = document.getElementById('searchInput');
const listenedCountEl = document.getElementById('listenedCount');
const totalCountEl = document.getElementById('totalCount');
const progressFill = document.getElementById('progressFill');
const gridMeta = document.getElementById('gridMeta');

const STORAGE_KEY = 'albums_listened_v1';

async function init() {
  await loadAlbums();
  loadState();
  renderGrid();
  updateProgress();
  attachEvents();
}

async function loadAlbums() {
  try {
    const res = await fetch('data/albums_with_genre_reason.json');
    const data = await res.json();

    // Assign IDs automatically
    albums = data.map((album, index) => ({
      id: index,
      ...album
    }));

    filteredAlbums = [...albums];
    totalCountEl.textContent = albums.length.toString();
  } catch (err) {
    console.error('Error loading albums JSON', err);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) listenedMap = JSON.parse(raw);
  } catch (err) {
    console.error('Error loading state', err);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listenedMap));
}

function attachEvents() {
  pickRandomBtn.addEventListener('click', handlePickRandom);
  resetBtn.addEventListener('click', handleReset);
  markListenedBtn.addEventListener('click', handleMarkListened);
  searchInput.addEventListener('input', handleSearchInput);
}

function handlePickRandom() {
  if (!albums.length) return;

  const unlistened = albums.filter(a => !listenedMap[a.id]);
  const pool = unlistened.length ? unlistened : albums;

  const randomIndex = Math.floor(Math.random() * pool.length);
  const album = pool[randomIndex];

  currentAlbum = album;
  renderRandomAlbum(album);
  hydrateNotes(album);
}

function handleReset() {
  if (!confirm('Reset all progress and notes?')) return;

  listenedMap = {};
  saveState();
  currentAlbum = null;

  notesTextarea.value = '';
  notesTextarea.disabled = true;
  markListenedBtn.disabled = true;

  randomAlbumCard.innerHTML = '<p class="empty-state">Click “Pick Random” to start your journey.</p>';
  randomAlbumCard.classList.add('album-card--empty');

  updateProgress();
  renderGrid();
}

function handleMarkListened() {
  if (!currentAlbum) return;

  listenedMap[currentAlbum.id] = {
    notes: notesTextarea.value.trim(),
    timestamp: new Date().toISOString()
  };

  saveState();
  updateProgress();
  renderGrid();

  markListenedBtn.textContent = 'Listened ✓';
}

function handleSearchInput(e) {
  const term = e.target.value.toLowerCase();

  filteredAlbums = albums.filter(album =>
    `${album.title} ${album.artist}`.toLowerCase().includes(term)
  );

  renderGrid();
}

function renderRandomAlbum(album) {
  randomAlbumCard.classList.remove('album-card--empty');
  randomAlbumCard.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'album-cover-wrapper';

  const img = document.createElement('img');
  img.className = 'album-cover';

  img.src = album.cover !== "Unknown" ? album.cover : "assets/placeholder.png";
  img.alt = album.title;

  wrapper.appendChild(img);

  const meta = document.createElement('div');
  meta.className = 'album-meta';

  meta.innerHTML = `
    <h3 class="album-title">${album.title}</h3>
    <p class="album-artist">${album.artist}</p>
    <div class="album-tags">
      <span class="album-tag album-tag--accent">${album.year}</span>
      <span class="album-tag">${album.genre}</span>
    </div>
  `;

  randomAlbumCard.appendChild(wrapper);
  randomAlbumCard.appendChild(meta);

  notesTextarea.disabled = false;
  markListenedBtn.disabled = false;

  markListenedBtn.textContent = listenedMap[album.id] ? 'Listened ✓' : 'Mark as listened';
}

function hydrateNotes(album) {
  notesTextarea.value = listenedMap[album.id]?.notes || '';
}

function renderGrid() {
  albumGrid.innerHTML = '';

  const list = filteredAlbums.length ? filteredAlbums : albums;
  gridMeta.textContent = `Showing ${list.length} albums`;

  list.forEach(album => {
    const card = document.createElement('div');
    card.className = 'album-grid-card';

    if (listenedMap[album.id]) {
      card.classList.add('album-grid-card--listened');
    }

    card.innerHTML = `
      <div class="album-grid-cover-wrapper">
        <img class="album-grid-cover" src="${album.cover !== "Unknown" ? album.cover : "assets/placeholder.png"}" alt="${album.title}">
      </div>
      <p class="album-grid-title">${album.title}</p>
      <p class="album-grid-artist">${album.artist}</p>
      <div class="album-grid-meta">
        <span>${album.year}</span>
        <span>${album.genre}</span>
      </div>
    `;

    card.addEventListener('click', () => {
      currentAlbum = album;
      renderRandomAlbum(album);
      hydrateNotes(album);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    albumGrid.appendChild(card);
  });
}

function updateProgress() {
  const listenedCount = Object.keys(listenedMap).length;
  listenedCountEl.textContent = listenedCount;

  const pct = (listenedCount / albums.length) * 100;
  progressFill.style.width = `${pct}%`;
}

init();
