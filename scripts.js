let albums = [];
let filteredAlbums = [];
let currentAlbum = null;
let listenedMap = {}; // { [albumId]: { notes: string, timestamp: string } }

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
    const res = await fetch('albums_with_genre_reason.json');
    albums = await res.json();
    filteredAlbums = [...albums];
    totalCountEl.textContent = albums.length.toString();
  } catch (err) {
    console.error('Error loading albums_with_genre_reason.json', err);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      listenedMap = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading state', err);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(listenedMap));
  } catch (err) {
    console.error('Error saving state', err);
  }
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
  const notes = notesTextarea.value.trim();
  listenedMap[currentAlbum.id] = {
    notes,
    timestamp: new Date().toISOString()
  };
  saveState();
  updateProgress();
  renderGrid();
  markListenedBtn.textContent = 'Listened ✓';
}

function handleSearchInput(e) {
  const term = e.target.value.toLowerCase();
  filteredAlbums = albums.filter(album => {
    const haystack = `${album.title} ${album.artist}`.toLowerCase();
    return haystack.includes(term);
  });
  renderGrid();
}

/* Rendering */

function renderRandomAlbum(album) {
  if (!album) return;
  randomAlbumCard.classList.remove('album-card--empty');
  randomAlbumCard.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'album-cover-wrapper';

  const img = document.createElement('img');
  img.className = 'album-cover';

  // 🔧 If your JSON uses a different field for cover,
  // change this line accordingly:
  img.src = `assets/album_covers/${album.cover}`;
  img.alt = album.title;

  wrapper.appendChild(img);

  const meta = document.createElement('div');
  meta.className = 'album-meta';

  const titleEl = document.createElement('h3');
  titleEl.className = 'album-title';
  titleEl.textContent = album.title;

  const artistEl = document.createElement('p');
  artistEl.className = 'album-artist';
  artistEl.textContent = album.artist;

  const tags = document.createElement('div');
  tags.className = 'album-tags';

  const yearTag = document.createElement('span');
  yearTag.className = 'album-tag album-tag--accent';
  yearTag.textContent = album.year;

  const genreTag = document.createElement('span');
  genreTag.className = 'album-tag';
  genreTag.textContent = album.genre || 'Unknown';

  tags.appendChild(yearTag);
  tags.appendChild(genreTag);

  meta.appendChild(titleEl);
  meta.appendChild(artistEl);
  meta.appendChild(tags);

  randomAlbumCard.appendChild(wrapper);
  randomAlbumCard.appendChild(meta);

  notesTextarea.disabled = false;
  markListenedBtn.disabled = false;

  if (listenedMap[album.id]) {
    markListenedBtn.textContent = 'Listened ✓';
  } else {
    markListenedBtn.textContent = 'Mark as listened';
  }
}

function hydrateNotes(album) {
  const entry = listenedMap[album.id];
  if (entry && entry.notes) {
    notesTextarea.value = entry.notes;
  } else {
    notesTextarea.value = '';
  }
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

    const coverWrapper = document.createElement('div');
    coverWrapper.className = 'album-grid-cover-wrapper';

    const img = document.createElement('img');
    img.className = 'album-grid-cover';
    img.src = `assets/album_covers/${album.cover}`;
    img.alt = album.title;

    coverWrapper.appendChild(img);

    const titleEl = document.createElement('p');
    titleEl.className = 'album-grid-title';
    titleEl.textContent = album.title;

    const artistEl = document.createElement('p');
    artistEl.className = 'album-grid-artist';
    artistEl.textContent = album.artist;

    const metaRow = document.createElement('div');
    metaRow.className = 'album-grid-meta';
    metaRow.innerHTML = `<span>${album.year}</span><span>${album.genre || 'Unknown'}</span>`;

    card.appendChild(coverWrapper);
    card.appendChild(titleEl);
    card.appendChild(artistEl);
    card.appendChild(metaRow);

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
  listenedCountEl.textContent = listenedCount.toString();
  const total = albums.length || 1;
  const pct = Math.min(100, (listenedCount / total) * 100);
  progressFill.style.width = `${pct}%`;
}

/* Kick off */

init();
