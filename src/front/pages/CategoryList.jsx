// src/front/pages/CategoryList.jsx
import React from "react";

const CategoryList = ({ categories = [], onDelete }) => {
  // Filtramos valores inválidos
  const safeCategories = categories.filter((cat) => cat && cat.name);

  if (!safeCategories.length) {
    return <div className="mc-empty">No hay categorías todavía.</div>;
  }

  return (
    <div className="mc-cards">
      {safeCategories.map((cat) => (
        <div key={cat.id} className="mc-card mc-card--category">
          {/* “Avatar” circular con la inicial, estilo hub */}
          <div className="mc-card-avatar">
            {cat.name[0]?.toUpperCase() || "?"}
          </div>

          <div className="mc-card-body">
            <div className="mc-card-title">{cat.name}</div>
            {cat.image_url && (
              <div className="mc-card-sub mc-card-sub--muted">
                Imagen asociada
              </div>
            )}
          </div>

          {onDelete && (
            <button
              type="button"
              className="mc-card-delete"
              onClick={() => onDelete(cat.id)}
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default CategoryList;
