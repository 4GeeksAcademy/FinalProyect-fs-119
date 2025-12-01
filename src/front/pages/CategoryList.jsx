import React from "react";

export default function CategoryList({ categories = [], onSelectCategory }) {
  if (!categories || categories.length === 0) {
    return <div className="text-muted">No hay categorías.</div>;
  }

  return (
    <div className="d-flex flex-column gap-2">
      {categories.map((c) => (
        <div
          key={c.id || c._id}
          className="d-flex justify-content-between align-items-center p-2"
          style={{ background: "#fff", borderRadius: 8 }}
        >
          <div
            style={{ cursor: onSelectCategory ? "pointer" : "default" }}
            onClick={() => onSelectCategory && onSelectCategory(c)}
          >
            <div style={{ fontWeight: 600 }}>{c.name}</div>
            <div style={{ fontSize: 12, color: "#666" }}>
              {c.description || ""}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
