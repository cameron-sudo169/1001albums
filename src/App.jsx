// src/App.jsx
import React, { useState, useEffect } from "react";
import albums from "./data/albums_with_genre_reason.json";

export default function App() {
  const [remaining, setRemaining] = useState([]);
  const [currentAlbum, setCurrentAlbum] = useState(null);
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState({});

  // Load saved progress
  useEffect(() => {
    const savedRemaining = localStorage.getItem("remainingAlbums");
    const savedNotes = localStorage.getItem("albumNotes");
    setRemaining(savedRemaining ? JSON.parse(savedRemaining) : albums);
    setNotes(savedNotes ? JSON.parse(savedNotes) : {});
  }, []);

  // Save progress
  useEffect(() => {
    localStorage.setItem("remainingAlbums", JSON.stringify(remaining));
  }, [remaining]);

  useEffect(() => {
    localStorage.setItem("albumNotes", JSON.stringify(notes));
  }, [notes]);

  // Random picker
  const pickRandom = () => {
    if (remaining.length === 0) return;
    const index = Math.floor(Math.random() * remaining.length);
    const selected = remaining[index];
    setCurrentAlbum(selected);
    setRemaining(remaining.filter((a) => a.title !== selected.title));
  };

  // Reset
  const reset = () => {
    setRemaining(albums);
    setCurrentAlbum(null);
  };

  // Search filter
  const filtered = albums.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.artist.toLowerCase().includes(search.toLowerCase())
  );

  // Save note
  const saveNote = (title, text) => {
    setNotes({ ...notes, [title]: text });
  };

  return (
    <div className="fade-in" style={{ padding: "20px" }}>
      <h1 className="text-4xl font-bold text-center mb-8">
        1001 Albums App
      </h1>

      {/* CONTROLS */}
      <div
        className="fade-in"
        style={{ display: "flex", gap: "16px", justifyContent: "center", marginBottom: "30px" }}
      >
        <button className="spotify-button" onClick={pickRandom}>
          Pick Random
        </button>

        <button className="spotify-button-secondary" onClick={reset}>
          Reset
        </button>
      </div>

      {/* CURRENT ALBUM PANEL */}
      {currentAlbum && (
        <div className="card-main fade-in" style={{ marginBottom: "40px" }}>
          <h2 className="text-2xl font-semibold">{currentAlbum.title}</h2>
          <p><strong>Artist:</strong> {currentAlbum.artist}</p>
          <p><strong>Year:</strong> {currentAlbum.year}</p>
          <p><strong>Genre:</strong> {currentAlbum.genre}</p>
          <p><strong>Why it's essential:</strong> {currentAlbum.reason}</p>

          <textarea
            className="notes-box"
            rows="4"
            placeholder="Your listening notes..."
            value={notes[currentAlbum.title] || ""}
            onChange={(e) => saveNote(currentAlbum.title, e.target.value)}
          />
        </div>
      )}

      {/* SEARCH */}
      <div className="fade-in" style={{ maxWidth: "500px", margin: "0 auto" }}>
        <input
