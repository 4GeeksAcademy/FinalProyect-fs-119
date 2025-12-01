import React from "react";

export default function IngredientsPanel({ ingredients }) {
  const list = Array.isArray(ingredients) ? ingredients : [];

  return (
    <div style={{ maxHeight: 260, overflowY: "auto" }}>
      {list.map((ing) => (
        <div
          key={ing.id}
          className="d-flex justify-content-between align-items-center py-2 border-bottom"
        >
          <div>
            <div style={{ fontWeight: 600 }}>{ing.name}</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              {ing.unit} · {(ing.price_per_unit ?? 0).toFixed(4)} €
            </div>
          </div>
        </div>
      ))}
      {list.length === 0 && (
        <div className="text-muted small">Aún no hay ingredientes.</div>
      )}
    </div>
  );
}