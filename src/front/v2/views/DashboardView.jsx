// src/front/v2/views/DashboardView.jsx
import React from "react";
import { formatNumber } from "../utils/formatters";
function Stat({ label, value }) {
  return (
    <div className="mc-stat">
      <div className="mc-stat-value">{value}</div>
      <div className="mc-stat-label">{label}</div>
    </div>
  );
}

function Table({ title, columns, rows, footer }) {
  return (
    <section className="mc-panel">
      <div className="mc-panel-head">
        <h3>{title}</h3>
      </div>
      <div className="mc-table">
        <div className="mc-tr mc-th">
          {columns.map((c) => (
            <div key={c} className="mc-td">
              {c}
            </div>
          ))}
        </div>

        {rows.length === 0 ? (
          <div className="mc-empty">Nada que mostrar todavía.</div>
        ) : (
          rows.map((r, idx) => (
            <div key={idx} className="mc-tr">
              {r.map((cell, cidx) => (
                <div key={cidx} className="mc-td">
                  {cell}
                </div>
              ))}
            </div>
          ))
        )}

        {footer && <div className="mc-footer">{footer}</div>}
      </div>
    </section>
  );
}

export default function DashboardView({ dishes, ingredients, categories }) {
  // Top dishes (MVP)
  const topDishesRows = (dishes || [])
    .slice(0, 5)
    .map((d) => [d.name || `Dish #${d.id}`, "—"]);

  // Alerts: sin precio + sin alérgenos
  const alertsNoCost = (ingredients || [])
    .filter((i) => i.price_per_unit == null || Number(i.price_per_unit) === 0)
    .map((i) => ({ name: i.name || `Ingredient #${i.id}`, status: "No Cost" }));

  const alertsNoAllergens = (ingredients || [])
    .filter((i) => !i.allergens || !String(i.allergens).trim())
    .map((i) => ({
      name: i.name || `Ingredient #${i.id}`,
      status: "No Allergens",
    }));

  const alertsRows = [...alertsNoCost, ...alertsNoAllergens]
    .slice(0, 5)
    .map((a) => [a.name, a.status]);

  return (
    <>
      <div className="mc-stats">
        <Stat label="Dishes" value={dishes?.length || 0} />
        <Stat label="Ingredients" value={ingredients?.length || 0} />
        <Stat label="Categories" value={categories?.length || 0} />
      </div>

      <div className="mc-grid-2">
        <Table
          title="Top Dishes (MVP)"
          columns={["Dish", "Margin %"]}
          rows={topDishesRows}
        />
        <Table
          title="Ingredient Alerts"
          columns={["Ingredient", "Status"]}
          rows={alertsRows}
          footer={
            <div className="mc-muted">
              Tip: completa alérgenos al crear el ingrediente (OpenFood)
            </div>
          }
        />
      </div>
    </>
  );
}
