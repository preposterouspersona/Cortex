import { useState, useEffect, useRef } from "react";
import { X, Trash2, Sparkles, Link2, Save, Loader } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../lib/api.js";

export default function EditorPanel({ noteId, notes, onClose, onSave, onDelete, onCreate }) {
  const [note, setNote] = useState({ title: "", content: "", tags: [], linkedIds: [] });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tagging, setTagging] = useState(false);
  const [linking, setLinking] = useState(false);
  const isNew = !noteId;
  const textRef = useRef(null);

  useEffect(() => {
    if (!noteId) {
      setNote({ title: "", content: "", tags: [], linkedIds: [] });
      return;
    }
    setLoading(true);
    api.getNote(noteId)
      .then((r) => setNote(r.data))
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, [noteId]);

  const handleAutoTag = async () => {
    if (!note.title && !note.content) return;
    setTagging(true);
    try {
      const { data } = await api.generateTags({ title: note.title, content: note.content });
      setNote((n) => ({ ...n, tags: data.tags }));
      toast.success("Tags generated");
    } catch {
      toast.error("Tagging failed");
    } finally {
      setTagging(false);
    }
  };

  const handleAutoLink = async () => {
    if (!note.title && !note.content) return;
    setLinking(true);
    try {
      const { data } = await api.findLinks({
        id: noteId || "preview",
        title: note.title,
        content: note.content,
      });
      setNote((n) => ({ ...n, linkedIds: data.linkedIds }));
      toast.success(`Found ${data.linkedIds.length} connection${data.linkedIds.length !== 1 ? "s" : ""}`);
    } catch {
      toast.error("Linking failed");
    } finally {
      setLinking(false);
    }
  };

  const handleSave = async () => {
    if (!note.title.trim() || !note.content.trim()) {
      toast.error("Title and content required");
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        const { data } = await api.createNote({
          title: note.title,
          content: note.content,
          tags: note.tags,
          linkedIds: note.linkedIds,
        });
        onCreate(data);
        toast.success("Created");
      } else {
        const { data } = await api.updateNote(noteId, note);
        onSave(data);
        toast.success("Saved");
      }
      onClose();
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await api.deleteNote(noteId);
      onDelete(noteId);
      toast.success("Deleted");
      onClose();
    } catch {
      toast.error("Delete failed");
    }
  };

  const removeTag = (tag) => setNote((n) => ({ ...n, tags: n.tags.filter((t) => t !== tag) }));

  const linkedNotes = (note.linkedIds || [])
    .map((id) => notes.find((n) => n._id === id))
    .filter(Boolean);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid rgba(139,92,246,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <span className="mono" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.1em" }}>
          {isNew ? "NEW ENTRY" : "EDIT ENTRY"}
        </span>
        <button className="btn-ghost" onClick={onClose} style={{ padding: "4px 8px" }}>
          <X size={14} />
        </button>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Loader size={20} style={{ color: "#8b5cf6", animation: "spin 1s linear infinite" }} />
        </div>
      ) : (
        <>
          {/* Editor body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
            {/* Title */}
            <input
              className="editor-input editor-title"
              placeholder="Title"
              value={note.title}
              onChange={(e) => setNote((n) => ({ ...n, title: e.target.value }))}
              style={{ marginBottom: 16, display: "block" }}
            />

            {/* Tags row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20, minHeight: 28 }}>
              {note.tags.map((tag) => (
                <span key={tag} className="tag-pill" onClick={() => removeTag(tag)}>
                  #{tag} <X size={9} />
                </span>
              ))}
              {note.tags.length === 0 && (
                <span className="mono" style={{ fontSize: 11, color: "#475569" }}>no tags yet</span>
              )}
            </div>

            {/* Content */}
            <textarea
              ref={textRef}
              className="editor-input editor-content"
              placeholder="Start writing..."
              value={note.content}
              rows={12}
              onChange={(e) => setNote((n) => ({ ...n, content: e.target.value }))}
              style={{ display: "block", marginBottom: 24 }}
            />

            {/* Linked entries */}
            {linkedNotes.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div className="mono" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.1em", marginBottom: 8 }}>
                  CONNECTED ENTRIES
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {linkedNotes.map((ln) => (
                    <div key={ln._id} className="linked-strip">
                      <div style={{ fontSize: 12, fontWeight: 500, color: "#06b6d4" }}>{ln.title}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                        {ln.content.slice(0, 80)}…
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI toolbar */}
          <div style={{
            padding: "12px 20px",
            borderTop: "1px solid rgba(139,92,246,0.15)",
            borderBottom: "1px solid rgba(139,92,246,0.15)",
            display: "flex",
            gap: 8,
            flexShrink: 0,
            background: "rgba(139,92,246,0.03)",
          }}>
            <button className="btn-ghost" onClick={handleAutoTag} disabled={tagging} style={{ fontSize: 12 }}>
              {tagging ? <Loader size={12} style={{ animation: "spin 1s linear infinite" }} /> : <Sparkles size={12} />}
              Auto-tag
            </button>
            <button className="btn-ghost" onClick={handleAutoLink} disabled={linking} style={{ fontSize: 12 }}>
              {linking ? <Loader size={12} style={{ animation: "spin 1s linear infinite" }} /> : <Link2 size={12} />}
              Find links
            </button>
          </div>

          {/* Footer actions */}
          <div style={{
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}>
            {!isNew ? (
              <button className="btn-danger" onClick={handleDelete} style={{ fontSize: 12 }}>
                <Trash2 size={12} /> Delete
              </button>
            ) : <div />}
            <button className="btn-accent" onClick={handleSave} disabled={saving}>
              {saving
                ? <Loader size={13} style={{ animation: "spin 1s linear infinite" }} />
                : <Save size={13} />}
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
