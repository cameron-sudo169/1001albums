import { useState, useMemo } from "react";
import albumsData from "./data/albums_with_genre_reason.json";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import RandomAlbum from "./components/RandomAlbum";
import AlbumGrid from "./components/AlbumGrid";
import NotesPanel from "./components/NotesPanel";
import ProgressBar from "./components/ProgressBar";

import "./styles/theme.css";
import "./styles/layout.css";
import "./styles/sidebar.css";
import "./styles/components.css";

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [currentAlbum, setCurrentAlbum] = useState(null);

  const [listened, setListened] = useState(() => {
    const saved = localStorage.getItem("listened_v1");
    return saved ? JSON.parse(saved) : {};
  });

  // Attach IDs to albums
  const albums = useMemo(() => {
    return albumsData.map((a, index) => ({ id: index, ...a }));
  }, []);

  // Search filter
  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return albums.filter(a =>
      `${a.title} ${a.artist}`.toLowerCase().includes(term)
    );
  }, [albums, search]);

  // Save listened state
  function saveListened(next) {
    setListened(next);
    localStorage.setItem("listened_v1", JSON.stringify(next));
  }

  // Random picker
  function pickRandom() {
    const unlistened = albums.filter(a => !listened[a.id]);
    const pool = unlistened.length ? unlistened : albums;
    const random = pool[Math.floor(Math.random() * pool.length)];
    setCurrentAlbum(random);
  }

  // Save notes + listened toggle
  function toggleListened(album, notes) {
    const next = { ...listened };

    if (notes || notes === "") {
      next[album.id] = { notes, timestamp: new Date().toISOString() };
    } else {
      delete next[album.id];
    }

    saveListened(next);
  }

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        listenedCount={Object.keys(listened).length}
        total={albums.length}
      />

      <main className={`main-content ${collapsed ? "collapsed" : ""}`}>
        <Header search={search} setSearch={setSearch} pickRandom={pickRandom} />

        <ProgressBar
          listened={Object.keys(listened).length}
          total={albums.length}
        />

        {currentAlbum && (
          <NotesPanel
            album={currentAlbum}
            listened={listened[currentAlbum.id]}
            onSave={toggleListened}
          />
        )}

        <RandomAlbum album={currentAlbum} />

        <AlbumGrid
          albums={filtered}
          listened={listened}
          onSelect={setCurrentAlbum}
        />
      </main>
    </div>
  );
}
