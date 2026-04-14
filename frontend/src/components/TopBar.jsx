import { Plus, Search, Brain } from "lucide-react";
import { useState } from "react";

export default function TopBar({ count, onNew, onSearch, searchQuery }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="top-bar">
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 16 }}>
        <Brain size={18} style={{ color: "#8b5cf6" }} />
        <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.02em" }}>
          Cortex
        </span>
        <span className="mono" style={{
          fontSize: 10,
          color: "#475569",
          background: "rgba(139,92,246,0.1)",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: 4,
          padding: "1px 6px",
          marginLeft: 4,
        }}>
          {count} {count === 1 ? "entry" : "entries"}
        </span>
      </div>

      {/* Search */}
      <div style={{
        flex: 1,
        maxWidth: 320,
        position: "relative",
        display: "flex",
        alignItems: "center",
      }}>
        <Search size={13} style={{
          position: "absolute",
          left: 10,
          color: focused ? "#8b5cf6" : "#475569",
          transition: "color 0.15s",
        }} />
        <input
          placeholder="Search entries..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${focused ? "rgba(139,92,246,0.4)" : "rgba(139,92,246,0.12)"}`,
            borderRadius: 8,
            padding: "7px 12px 7px 30px",
            color: "#e2e8f0",
            fontSize: 13,
            outline: "none",
            transition: "border-color 0.15s",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* New button */}
      <button className="btn-accent" onClick={onNew} style={{ fontSize: 13 }}>
        <Plus size={14} />
        New entry
      </button>
    </div>
  );
}
