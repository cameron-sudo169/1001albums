// src/App.jsx
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
import "./styles/components.css";
import "./styles/sidebar.css";

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [currentAlbum, setCurrentAlbum] = useState(null);
  const [listened, setListened] = useState(() => {
    const saved = localStorage.getItem("listened_v1");
    return saved ? JSON.parse(saved) : {};
  });

  const albums = useMemo(() => {
    return albumsData.map((a, index) => ({ id: index, ...a }));
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return albums.filter(a =>
      `${a.title} ${a.artist}`.toLowerCase().includes(term)
    );
  }, [albums, search]);

  function saveListened(next) {
    setListened(next);
    localStorage.setItem("listened_v1", JSON.stringify(next));
  }

  function pickRandom() {
    const unlistened = albums.filter(a => !listened[a.id]);
    const pool = unlistened.length ? unlistened : albums;
    const random = pool[Math.floor(Math.random() * pool.length)];
    setCurrentAlbum(random);
  }

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
// src/components/Sidebar.jsx
import { ChevronLeft, Home, Grid, CheckCircle } from "lucide-react";

export default function Sidebar({ collapsed, setCollapsed, listenedCount, total }) {
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-top">
        <div className="sidebar-title">
          {!collapsed && <h1>1001 Albums</h1>}
        </div>

        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className={collapsed ? "rotated" : ""} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <SidebarItem icon={<Home />} label="Random" collapsed={collapsed} />
        <SidebarItem icon={<Grid />} label="Browse" collapsed={collapsed} />
        <SidebarItem
          icon={<CheckCircle />}
          label="Listened"
          collapsed={collapsed}
        />
      </nav>

      <div className="sidebar-progress">
        <div className="sidebar-progress-label">
          {!collapsed && <span>Progress</span>}
        </div>
        <div className="sidebar-progress-bar">
          <div
            className="sidebar-progress-fill"
            style={{ height: `${(listenedCount / total) * 100}%` }}
          />
        </div>
      </div>
    </aside>
  );
}

function SidebarItem({ icon, label, collapsed }) {
  return (
    <div className="sidebar-item">
      {icon}
      {!collapsed && <span>{label}</span>}
    </div>
  );
}
// src/components/Header.jsx
import { Search, Shuffle } from "lucide-react";

export default function Header({ search, setSearch, pickRandom }) {
  return (
    <header className="header">
      <div className="search-box">
        <Search />
        <input
          type="text"
          placeholder="Search albums or artists"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <button className="random-btn" onClick={pickRandom}>
        <Shuffle />
        <span>Random</span>
      </button>
    </header>
  );
}
// src/components/RandomAlbum.jsx
export default function RandomAlbum({ album }) {
  if (!album) return null;

  return (
    <div className="random-card">
      <img
        src={album.cover !== "Unknown" ? album.cover : "https://via.placeholder.com/300"}
        alt={album.title}
      />

      <div className="random-meta">
        <h2>{album.title}</h2>
        <p>{album.artist}</p>

        <div className="tags">
          <span>{album.year}</span>
          <span>{album.genre}</span>
        </div>
      </div>
    </div>
  );
}
// src/components/NotesPanel.jsx
import { Check } from "lucide-react";
import { useState, useEffect } from "react";

export default function NotesPanel({ album, listened, onSave }) {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setNotes(listened?.notes || "");
  }, [album, listened]);

  return (
    <div className="notes-panel">
      <textarea
        placeholder="Your notes..."
        value={notes}
        onChange={e => setNotes(e.target.value)}
      />

      <button onClick={() => onSave(album, notes)}>
        <Check />
        <span>Mark as listened</span>
      </button>
    </div>
  );
}
// src/components/AlbumGrid.jsx
export default function AlbumGrid({ albums, listened, onSelect }) {
  return (
    <div className="album-grid">
      {albums.map(album => (
        <div
          key={album.id}
          className={`album-card ${listened[album.id] ? "listened" : ""}`}
          onClick={() => onSelect(album)}
        >
          <img
            src={album.cover !== "Unknown" ? album.cover : "https://via.placeholder.com/300"}
            alt={album.title}
          />
          <h4>{album.title}</h4>
          <p>{album.artist}</p>
        </div>
      ))}
    </div>
  );
}
// src/components/ProgressBar.jsx
export default function ProgressBar({ listened, total }) {
  const pct = (listened / total) * 100;

  return (
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
