import React from "react";

export default function DishList({ dishes = [], onDelete = () => {}, onView = () => {} }) {
  if (!dishes || dishes.length === 0) return <div>No hay platos</div>;
  return (
    <div className="list-group">
      {dishes.map((d) => (
        <div key={d.id} className="list-group-item d-flex justify-content-between align-items-center">
          <div>
            <strong>{d.name}</strong>
            <div className="text-muted small">{d.description}</div>
          </div>
          <div>
            <span className="badge bg-secondary me-2">Cost: {d.cost_price ?? d.total_cost ?? 0}</span>
            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onView(d)}>Ver</button>
            <button className="btn btn-sm btn-danger" onClick={() => onDelete(d.id)}>Eliminar</button>
          </div>
        </div>
      ))}
    </div>
  );
}
