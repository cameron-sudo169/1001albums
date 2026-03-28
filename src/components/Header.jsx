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
