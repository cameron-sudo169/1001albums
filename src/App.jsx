import React, { useState, useEffect } from "react";
import albums from "./data/albums_with_genre_reason.json";

export default function App() {
  const [remaining, setRemaining] = useState([]);
  const [currentAlbum, setCurrentAlbum] = useState(null);
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState({});
  const [albumInfo, setAlbumInfo] = useState(""); // AI-generated text

  // --- Fetch AI-generated album insight from your API route ---
  const fetchAlbumInfo = async (album, artist) => {
    const res = await fetch("/api/album-info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ album, artist }),
    });

    const data = await res.json();
    return data.text; // matches what the backend returns
  };

  // Load saved albums + saved notes from localStorage
  useEffect(() => {
    const savedRemaining = localStorage.getItem("remainingAlbums");
    const savedNotes = localStorage.getItem("albumNotes");

    setRemaining(savedRemaining ? JSON.parse(savedRemaining) : albums);
    setNotes(savedNotes ? JSON.parse(savedNotes) : {});
  }, []);

  // Save remaining albums
  useEffect(() => {
    localStorage.setItem("remainingAlbums", JSON.stringify(remaining));
  }, [remaining]);

  // Save notes
  useEffect(() => {
    localStorage.setItem("albumNotes", JSON.stringify(notes));
  }, [notes]);

  // --- Pick a random album + fetch AI description ---
  const pickRandom = async () => {
    if (remaining.length === 0) return;

    const index = Math.floor(Math.random() * remaining.length);
    const selected = remaining[index];

    setCurrentAlbum(selected);
    setRemaining(remaining.filter((a) => a.title !== selected.title));
    setAlbumInfo("Loading AI insight..."); // temporary message

    // Get AI-generated album insight
    const info = await fetchAlbumInfo(selected.title, selected.artist);
    setAlbumInfo(info);
  };

  // Reset app
  const reset = () => {
    setRemaining(albums);
    setCurrentAlbum(null);
    setAlbumInfo("");
  };

  // Search filter
  const filtered = albums.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.artist.toLowerCase().includes(search.toLowerCase())
  );

  const saveNote = (title, text) => {
    setNotes({ ...notes, [title]: text });
  };

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

      {currentAlbum && (
        <div className="card-main fade-in">
          <h2 className="album-title">{currentAlbum.title}</h2>
          <p><strong>Artist:</strong> {currentAlbum.artist}</p>
          <p><strong>Year:</strong> {currentAlbum.year}</p>
          <p><strong>Genre:</strong> {currentAlbum.genre}</p>

          {/* AI Insight */}
          <p><strong>AI Album Insight:</strong></p>
          <p style={{ marginBottom: "15px", opacity: 0.9 }}>
            {albumInfo}
          </p>

          {/* Notes */}
          <textarea
            className="notes-box"
            rows="4"
            placeholder="Your listening notes..."
            value={notes[currentAlbum.title] || ""}
            onChange={(e) => saveNote(currentAlbum.title, e.target.value)}
          />
        </div>
      )}

      <div className="search-wrapper fade-in">
        <input
          className="search-box"
          placeholder="Search albums or artists..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="album-grid fade-in">
        {filtered.map((a) => (
          <div key={a.title} className="album-card fade-in">
            <h3 className="album-name">{a.title}</h3>
            <p className="album-artist">
              {a.artist} ({a.year})
            </p>
            <p className="album-genre">{a.genre}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
