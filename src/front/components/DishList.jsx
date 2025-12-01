// src/front/components/DishList.jsx
import React from "react";

export default function DishList({
  dishes = [],
  categories = [],
  onDelete = () => {},
  onView = () => {},
}) {
  if (!dishes || dishes.length === 0) return <div>No hay platos</div>;

  const findCategoryName = (category_id) => {
    if (!category_id) return null;
    const cat = categories.find((c) => c.id === category_id);
    return cat ? cat.name : null;
  };

  return (
    <div className="list-group">
      {dishes.map((d) => {
        const catName = findCategoryName(d.category_id);
        const cost =
          d.total_cost != null
            ? d.total_cost
            : d.cost_price != null
            ? d.cost_price
            : 0;

        return (
          <div
            key={d.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              <strong>{d.name}</strong>
              {catName && (
                <div className="text-muted small">
                  Categoría: {catName}
                </div>
              )}
              {d.description && (
                <div className="text-muted small">{d.description}</div>
              )}
            </div>
            <div>
              <span className="badge bg-secondary me-2">
                Coste: {cost} €
              </span>
              <button
                className="btn btn-sm btn-outline-primary me-2"
                onClick={() => onView(d)}
              >
                Ver
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => onDelete(d.id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
