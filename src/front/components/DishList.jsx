// src/front/components/DishList.jsx
import React from "react";
import { formatNumber } from "../v2/utils/formatters";

const DishList = ({ dishes = [], categories = [], onDelete, onView }) => {
  if (!dishes || dishes.length === 0) {
    return <div className="mc-empty">No hay platos todavía.</div>;
  }

  const getCategoryName = (category_id) => {
    if (!category_id) return null;
    const cat = categories.find((c) => c.id === category_id);
    return cat ? cat.name : null;
  };

  return (
    <div className="mc-cards mc-cards--dishes">
      {dishes.map((dish) => {
        const catName = getCategoryName(dish.category_id);
        const costRaw = dish.total_cost ?? dish.cost_price ?? 0;
        const cost = formatNumber(costRaw, 2); // ✅ siempre 2 decimales

        return (
          <div key={dish.id} className="mc-card mc-card--dish">
            {/* Bloque principal: nombre + categoría */}
            <div className="mc-card-body">
              <div className="mc-card-title">
                {dish.name || `Dish #${dish.id}`}
              </div>
              <div className="mc-card-sub mc-card-sub--muted">
                {catName || <span className="mc-muted">Sin categoría</span>}
              </div>
            </div>

            {/* Bloque de coste grande */}
            <div className="mc-card-cost-block">
              <div className="mc-card-cost-label">Coste</div>
              <div className="mc-card-cost-value">{cost} €</div>
            </div>

            {/* Acciones */}
            <div className="mc-card-actions">
              {onView && (
                <button
                  type="button"
                  className="mc-btn-ghost"
                  onClick={() => onView(dish)}
                >
                  Ver
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  className="mc-link-danger"
                  onClick={() => onDelete(dish.id)}
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DishList;
