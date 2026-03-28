export default function ProgressBar({ listened, total }) {
  const pct = (listened / total) * 100;

  return (
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
