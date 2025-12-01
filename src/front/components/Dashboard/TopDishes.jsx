import React from "react";

export default function TopDishes({ dishes }) {
  const list = Array.isArray(dishes) ? dishes : [];

  return (
    <div style={{ maxHeight: 260, overflowY: "auto" }}>
      {list.map((d) => (
        <div
          key={d.id || d._id}
          className="d-flex justify-content-between align-items-center py-2 border-bottom"
        >
          <div>
            <div style={{ fontWeight: 600 }}>{d.name}</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              {d.description || ""}
            </div>
          </div>
          <div style={{ textAlign: "right", minWidth: 110 }}>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Coste total</div>
            <div style={{ fontWeight: 600 }}>
              {(d.cost_price ?? 0).toFixed(4)} €
            </div>
          </div>
        </div>
      ))}
      {list.length === 0 && (
        <div className="text-muted small">Aún no hay platos.</div>
      )}
    </div>
  );
}