import React from "react";

export default function Toolbar({ onClear, color, setColor, size, setSize }) {
  return (
    <div style={{ padding: 8, background: "#f0f0f0", display: "flex", gap: 8, alignItems: "center" }}>
      <button onClick={onClear}>Clear</button>
      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        Color:
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
      </label>
      <label>
        Size:
        <select value={size} onChange={(e) => setSize(Number(e.target.value))}>
          <option value={2}>Thin</option>
          <option value={5}>Medium</option>
          <option value={10}>Thick</option>
        </select>
      </label>
    </div>
  );
}
