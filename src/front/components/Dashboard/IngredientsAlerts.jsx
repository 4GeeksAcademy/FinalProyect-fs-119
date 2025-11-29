import React from "react";

export default function IngredientAlerts({ ingredients = [] }) {
  // ejemplo: alertar ingredientes sin price o con price 0
  const alerts = ingredients.filter((i) => !i.price_per_unit || Number(i.price_per_unit) <= 0);

  return (
    <div>
      {alerts.length === 0 && <div className="text-muted">No alerts</div>}
      <ul className="list-unstyled mb-0">
        {alerts.map((a) => (
          <li key={a.id} className="py-2 border-bottom">
            <div className="d-flex justify-content-between">
              <div>{a.name}</div>
              <div className="text-muted small">No Cost</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
