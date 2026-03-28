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
