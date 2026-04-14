import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Brain } from "lucide-react";
import Graph from "./components/Graph.jsx";
import EditorPanel from "./components/EditorPanel.jsx";
import TopBar from "./components/TopBar.jsx";
import { api } from "./lib/api.js";

export default function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    api.getNotes()
      .then((r) => setNotes(r.data))
      .finally(() => setLoading(false));
  }, []);

  const filteredNotes = searchQuery.trim()
    ? notes.filter((n) =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.tags || []).some((t) => t.includes(searchQuery.toLowerCase()))
      )
    : notes;

  const openNote = (id) => {
    if (!id) { setSelectedId(null); setPanelOpen(false); return; }
    setSelectedId(id);
    setIsNew(false);
    setPanelOpen(true);
  };

  const openNew = () => {
    setSelectedId(null);
    setIsNew(true);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setTimeout(() => { setSelectedId(null); setIsNew(false); }, 350);
  };

  const handleSave = (updated) => {
    setNotes((prev) => prev.map((n) => (n._id === updated._id ? updated : n)));
  };

  const handleCreate = (created) => {
    setNotes((prev) => [created, ...prev]);
  };

  const handleDelete = (id) => {
    setNotes((prev) => prev.filter((n) => n._id !== id));
  };

  return (
    <>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#0f0f1a",
            color: "#e2e8f0",
            border: "1px solid rgba(139,92,246,0.3)",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 13,
          },
        }}
      />

      <TopBar count={notes.length} onNew={openNew} onSearch={setSearchQuery} searchQuery={searchQuery} />

      <div style={{ paddingTop: 56, height: "100vh" }}>
        {loading ? (
          <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
            <Brain size={28} style={{ color: "#8b5cf6", opacity: 0.8 }} />
            <span className="mono" style={{ fontSize: 12, color: "#475569" }}>loading cortex…</span>
          </div>
        ) : filteredNotes.length === 0 && !searchQuery ? (
          <div className="empty-state">
            <Brain size={40} style={{ color: "#8b5cf6", opacity: 0.3, margin: "0 auto 16px" }} />
            <p style={{ color: "#334155", fontSize: 15, fontWeight: 500 }}>Your knowledge graph is empty</p>
            <p style={{ color: "#1e293b", fontSize: 13, marginTop: 6 }}>Create your first entry to start mapping your thinking</p>
          </div>
        ) : filteredNotes.length === 0 && searchQuery ? (
          <div className="empty-state">
            <p style={{ color: "#334155", fontSize: 14 }}>No entries match "{searchQuery}"</p>
          </div>
        ) : (
          <Graph notes={filteredNotes} onSelectNote={openNote} selectedId={selectedId} />
        )}
      </div>

      {searchQuery && filteredNotes.length > 0 && (
        <div style={{ position: "fixed", top: 72, left: 16, width: 260, background: "rgba(15,15,26,0.95)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, overflow: "hidden", backdropFilter: "blur(20px)", zIndex: 45, maxHeight: "70vh", overflowY: "auto" }}>
          <div className="mono" style={{ padding: "8px 12px", fontSize: 10, color: "#475569", borderBottom: "1px solid rgba(139,92,246,0.1)" }}>
            {filteredNotes.length} RESULT{filteredNotes.length !== 1 ? "S" : ""}
          </div>
          {filteredNotes.map((n) => (
            <div key={n._id} onClick={() => openNote(n._id)}
              style={{ padding: "10px 12px", cursor: "pointer", borderBottom: "1px solid rgba(139,92,246,0.06)", transition: "background 0.1s" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(139,92,246,0.08)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>{n.title}</div>
              <div style={{ fontSize: 11, color: "#475569", marginTop: 3 }}>{n.content.slice(0, 60)}…</div>
              {n.tags?.length > 0 && (
                <div style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap" }}>
                  {n.tags.slice(0, 3).map((t) => (
                    <span key={t} style={{ fontSize: 10, fontFamily: "monospace", color: "#8b5cf6", background: "rgba(139,92,246,0.1)", padding: "1px 6px", borderRadius: 4 }}>#{t}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {notes.length > 0 && (
        <div style={{ position: "fixed", bottom: 20, left: 20, display: "flex", gap: 16, zIndex: 40 }}>
          {[
            { label: "ENTRIES", val: notes.length },
            { label: "TAGS", val: [...new Set(notes.flatMap((n) => n.tags || []))].length },
            { label: "LINKS", val: notes.reduce((s, n) => s + (n.linkedIds?.length || 0), 0) },
          ].map(({ label, val }) => (
            <div key={label} style={{ background: "rgba(15,15,26,0.8)", border: "1px solid rgba(139,92,246,0.12)", borderRadius: 8, padding: "5px 12px", backdropFilter: "blur(10px)" }}>
              <span className="mono" style={{ fontSize: 14, fontWeight: 500, color: "#8b5cf6" }}>{val}</span>
              <span className="mono" style={{ fontSize: 9, color: "#334155", marginLeft: 6 }}>{label}</span>
            </div>
          ))}
        </div>
      )}

      <div className={`editor-panel ${panelOpen ? "open" : ""}`}>
        {panelOpen && (
          <EditorPanel
            noteId={isNew ? null : selectedId}
            notes={notes}
            onClose={closePanel}
            onSave={handleSave}
            onCreate={handleCreate}
            onDelete={handleDelete}
          />
        )}
      </div>

      {panelOpen && (
        <div onClick={closePanel} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 49, backdropFilter: "blur(2px)" }} />
      )}
    </>
  );
}
