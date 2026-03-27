import React, { useState, useEffect } from "react";
import albums from "./data/albums_with_genre_reason.json";

/* --------------------------------------------------------- */
/*   Extract the dominant color from an image using canvas   */
/* --------------------------------------------------------- */
function getDominantColor(imgElement) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = imgElement.naturalWidth;
  canvas.height = imgElement.naturalHeight;

  ctx.drawImage(imgElement, 0, 0);

  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  let r = 0, g = 0, b = 0, count = 0;

  // Sample every 40 pixels for speed
  for (let i = 0; i < data.length; i += 40 * 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    count++;
  }

  r = Math.round(r / count);
  g = Math.round(g / count);
  b = Math.round(b / count);

  return { r, g, b };
}

export default function App() {
  const [remaining, setRemaining] = useState([]);
  const [currentAlbum, setCurrentAlbum] = useState(null);
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState({});

  /* --------------------------------------------------------- */
  /*               Load saved data from localStorage           */
  /* --------------------------------------------------------- */
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

  /* --------------------------------------------------------- */
  /*                    Pick Random Album                      */
  /* --------------------------------------------------------- */
  const pickRandom = () => {
    if (remaining.length === 0) return;
    const index = Math.floor(Math.random() * remaining.length);
    const selected = remaining[index];
    setCurrentAlbum(selected);
    setRemaining(remaining.filter((a) => a.title !== selected.title));
  };

  /* --------------------------------------------------------- */
  /*                         Reset List                        */
  /* --------------------------------------------------------- */
  const reset = () => {
    setRemaining(albums);
    setCurrentAlbum(null);
  };

  /* --------------------------------------------------------- */
  /*                       Search Filter                       */
  /* --------------------------------------------------------- */
  const filtered = albums.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.artist.toLowerCase().includes(search.toLowerCase())
  );

  /* --------------------------------------------------------- */
  /*                         Save Notes                        */
  /* --------------------------------------------------------- */
  const saveNote = (title, text) => {
    setNotes({ ...notes, [title]: text });
  };

  /* --------------------------------------------------------- */
  /*            Dynamic Theming When Album Changes             */
  /* --------------------------------------------------------- */
  useEffect(() => {
    if (!currentAlbum || !currentAlbum.cover) return;

    const img = new Image();
    img.crossOrigin = "anonymous"; // required for CORS-safe extraction
    img.src = currentAlbum.cover;

    img.onload = () => {
      const { r, g, b } = getDominantColor(img);

      // Build theme colors
      const accent = `rgb(${r}, ${g}, ${b})`;
      const accentSoft = `rgba(${r + 40}, ${g + 40}, ${b + 40}, 0.22)`;
      const cardBg = `rgba(${r + 60}, ${g + 60}, ${b + 60}, 0.18)`;
      const bg = `rgba(${r + 80}, ${g + 80}, ${b + 80}, 0.22)`;

      // Apply CSS variables
      const root = document.documentElement;
      root.style.setProperty("--accent", accent);
      root.style.setProperty("--accent-soft", accentSoft);
      root.style.setProperty("--card-bg", cardBg);
      root.style.setProperty("--bg", bg);
    };
  }, [currentAlbum]);

  /* --------------------------------------------------------- */
  /*                         RENDER UI                         */
  /* --------------------------------------------------------- */
  return (
    <div className="fade-in" style={{ padding: "20px" }}>
      <h1 className="app-title">1001 Albums App</h1>

      <div className="controls-row fade-in">
        <button className="button-primary" onClick={pickRandom}>
          Pick Random
        </button>
        <button className="button-secondary" onClick={reset}>
          Reset
        </button>
      </div>

      {/* ⭐ Centered Album Card */}
      {currentAlbum && (
        <div className="center-card-wrapper">
          <div className="card-main fade-in">
            
            {/* Album Cover */}
            {currentAlbum.cover && (
              <img
                src={currentAlbum.cover}
                alt={currentAlbum.title}
                className="album-cover"
              />
            )}

            {/* Album Info */}
            <h2 className="album-title">{currentAlbum.title}</h2>
            <p><strong>Artist:</strong> {currentAlbum.artist}</p>
            <p><strong>Year:</strong> {currentAlbum.year}</p>
            <p><strong>Genre:</strong> {currentAlbum.genre}</p>

            {/* Notes */}
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

      {/* Search Bar */}
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

      {/* Album Grid */}
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
