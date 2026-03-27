import React, { useState, useEffect } from "react";
import albums from "./data/albums_with_genre_reason.json";

/* ----------------------------------------------------------- */
/*     Vibrant Color Extractor (ignores grey/white pixels)     */
/* ----------------------------------------------------------- */
function getVibrantColor(imgElement) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = imgElement.naturalWidth;
  canvas.height = imgElement.naturalHeight;

  ctx.drawImage(imgElement, 0, 0);

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const colors = [];

  for (let i = 0; i < data.length; i += 4 * 20) { // sample ~5% pixels
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Calculate saturation
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max - min;

    // Ignore greys / whites / blacks (too dull)
    if (saturation < 20) continue;

    colors.push({ r, g, b, saturation });
  }

  if (colors.length === 0) {
    return { r: 160, g: 160, b: 160 }; // fallback
  }

  // Highest saturation = most vibrant color
  colors.sort((a, b) => b.saturation - a.saturation);

  let { r, g, b } = colors[0];

  // Slight vibrancy boost (prevents washed-out palettes)
  r = Math.min(255, r * 1.2);
  g = Math.min(255, g * 1.2);
  b = Math.min(255, b * 1.2);

  return { r, g, b };
}

export default function App() {
  const [remaining, setRemaining] = useState([]);
  const [currentAlbum, setCurrentAlbum] = useState(null);
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState({});

  /* ----------------------------------------------- */
  /*           Load saved state from storage         */
  /* ----------------------------------------------- */
  useEffect(() => {
    const savedRemaining = localStorage.getItem("remainingAlbums");
    const savedNotes = localStorage.getItem("albumNotes");

    setRemaining(savedRemaining ? JSON.parse(savedRemaining) : albums);
    setNotes(savedNotes ? JSON.parse(savedNotes) : {});
  }, []);

  useEffect(() => {
    localStorage.setItem("remainingAlbums", JSON.stringify(remaining));
  }, [remaining]);

  useEffect(() => {
    localStorage.setItem("albumNotes", JSON.stringify(notes));
  }, [notes]);

  /* ----------------------------------------------- */
  /*                 Pick random album               */
  /* ----------------------------------------------- */
  const pickRandom = () => {
    if (remaining.length === 0) return;

    const index = Math.floor(Math.random() * remaining.length);
    const selected = remaining[index];

    setCurrentAlbum(selected);
    setRemaining(remaining.filter((a) => a.title !== selected.title));
  };

  const reset = () => {
    setRemaining(albums);
    setCurrentAlbum(null);
  };

  /* ----------------------------------------------- */
  /*                  Search filtering               */
  /* ----------------------------------------------- */
  const filtered = albums.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.artist.toLowerCase().includes(search.toLowerCase())
  );

  const saveNote = (title, text) => {
    setNotes({ ...notes, [title]: text });
  };

  /* ----------------------------------------------------------- */
  /*            Dynamic Theming: Update CSS variables            */
  /* ----------------------------------------------------------- */
  useEffect(() => {
    if (!currentAlbum || !currentAlbum.cover) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = currentAlbum.cover;

    img.onload = () => {
      const { r, g, b } = getVibrantColor(img);

      const accent = `rgb(${r}, ${g}, ${b})`;
      const cardBg = `rgba(${r}, ${g}, ${b}, 0.18)`;
      const bg = `rgba(${r}, ${g}, ${b}, 0.12)`;
      const soft = `rgba(${r}, ${g}, ${b}, 0.30)`;

      const root = document.documentElement;

      root.style.setProperty("--accent", accent);
      root.style.setProperty("--accent-soft", soft);
      root.style.setProperty("--card-bg", cardBg);
      root.style.setProperty("--bg", bg);
    };
  }, [currentAlbum]);

  /* ----------------------------------------------------------- */
  /*                           UI Render                         */
  /* ----------------------------------------------------------- */
  return (
    <div className="fade-in" style={{ padding: "20px" }}>
      <h1 className="app-title">1001 Albums App</h1>

      <div className="controls-row fade-in">
        <button onClick={pickRandom}>Pick Random</button>
        <button onClick={reset}>Reset</button>
      </div>

      {/* ⭐ RANDOM ALBUM CARD */}
      {currentAlbum && (
        <div className="center-card-wrapper">
          <div className="card-main fade-in">

            {currentAlbum.cover && (
              <img
                src={currentAlbum.cover}
                alt={currentAlbum.title}
                className="album-cover"
              />
            )}

            <h2 className="album-title">{currentAlbum.title}</h2>
            <p><strong>Artist:</strong> {currentAlbum.artist}</p>
            <p><strong>Year:</strong> {currentAlbum.year}</p>
            <p><strong>Genre:</strong> {currentAlbum.genre}</p>

            <textarea
              className="notes-box"
              rows="4"
              placeholder="Your listening notes..."
              value={notes[currentAlbum.title] || ""}
              onChange={(e) => saveNote(currentAlbum.title, e.target.value)}
            />
          </div>
        </div>
      )}

      {/* SEARCH BAR */}
      {!currentAlbum && (
        <div className="search-wrapper fade-in">
          <input
            className="search-box"
            placeholder="Search albums or artists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* GRID VIEW */}
      {!currentAlbum && (
        <div className="album-grid fade-in">
          {filtered.map((a) => (
            <div key={a.title} className="album-card fade-in">

              {a.cover && (
                <img
                  src={a.cover}
                  alt={a.title}
                  className="album-cover-grid"
                />
              )}

              <h3 className="album-name">{a.title}</h3>
              <p className="album-artist">
                {a.artist} ({a.year})
              </p>
              <p className="album-genre">{a.genre}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
