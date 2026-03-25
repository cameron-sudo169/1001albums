// src/App.jsx
import React, { useState, useEffect } from "react";
import albums from "./data/albums_with_genre_reason.json";

/* ---------------------------------------------------------
   🎵 Helper: Fetch album cover art (Spotify‑style requirement)
------------------------------------------------------------*/
async function getCoverArt(artist, title) {
  try {
    const query = `${title} ${artist}`.replace(/ /g, "+");
    const res = await fetch(
      `https://itunes.apple.com/search?term=${query}&entity=album&limit=1`
    );

    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].artworkUrl100.replace("100x100", "600x600");
    }
  } catch (e) {
    console.warn("Cover not found:", e);
  }

  // fallback image
  return "/default-cover.png";
}

export default function App() {
  const [remaining, setRemaining] = useState([]);
  const [currentAlbum, setCurrentAlbum] = useState(null);
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState({});
  const [covers, setCovers] = useState({}); // store fetched covers

  /* ---------------------------------------------------------
     🔄 Load saved data or default album list
  ------------------------------------------------------------*/
  useEffect(() => {
