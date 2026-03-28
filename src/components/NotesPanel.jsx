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
