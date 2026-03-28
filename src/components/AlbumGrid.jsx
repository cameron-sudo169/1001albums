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
