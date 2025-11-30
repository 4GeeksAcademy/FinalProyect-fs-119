import React from "react";
import "./mastercard.css";

const NAV = [
  { key: "dashboard", label: "Dashboard" },
  { key: "dishes", label: "Dishes" },
  { key: "ingredients", label: "Ingredients" },
  { key: "categories", label: "Categories" },
  { key: "restaurants", label: "Restaurant" },
  { key: "profile", label: "Profile" },
];

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
            <div key={c} className="mc-td">{c}</div>
          ))}
        </div>

        {rows.length === 0 ? (
          <div className="mc-empty">Nada que mostrar todavía.</div>
        ) : (
          rows.map((r, idx) => (
            <div key={idx} className="mc-tr">
              {r.map((cell, cidx) => (
                <div key={cidx} className="mc-td">{cell}</div>
              ))}
            </div>
          ))
        )}

        {footer && <div className="mc-footer">{footer}</div>}
      </div>
    </section>
  );
}

export default function MasterCard({ store, dispatch }) {
  const view = store.currentView || "restaurants";
  const restaurants = store.restaurants || [];
  const currentRestaurant = store.currentRestaurant;

  const dishes = store.dishes || [];
  const ingredients = currentRestaurant?.ingredients || [];
  const categories = currentRestaurant?.categories || [];

  const setView = (k) => dispatch({ type: "set_currentView", payload: k });

  const onSelectRestaurant = (rid) => {
    const r = restaurants.find((x) => String(x.id) === String(rid));
    if (!r) return;
    dispatch({ type: "set_currentRestaurant", payload: r });
    dispatch({ type: "set_currentView", payload: "dashboard" });
  };

  // Mini helpers para dashboard (MVP no inventa márgenes si no están)
  const topDishesRows = dishes.slice(0, 5).map((d) => [d.name || `Dish #${d.id}`, "—"]);
  const alertsRows = ingredients
    .filter((i) => i.price_per_unit == null || Number(i.price_per_unit) === 0)
    .slice(0, 5)
    .map((i) => [i.name || `Ingredient #${i.id}`, "No Cost"]);

  return (
    <div className="mc-wrap">
      <aside className="mc-side">
        <div className="mc-brand">
          <div className="mc-logo">Ⓒ</div>
          <div className="mc-brand-text">set a meal</div>
        </div>

        <nav className="mc-nav">
          {NAV.map((item) => (
            <button
              key={item.key}
              className={`mc-nav-item ${view === item.key ? "is-active" : ""}`}
              onClick={() => setView(item.key)}
              disabled={
                // Bloqueamos vistas que dependen de restaurante si no hay seleccionado
                ["dashboard", "dishes", "ingredients", "categories"].includes(item.key) && !currentRestaurant?.id
              }
            >
              <span className="mc-dot" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="mc-main">
        <header className="mc-topbar">
          <div className="mc-topbar-left">
            <div className="mc-page-title">
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </div>
            <div className="mc-muted">
              {currentRestaurant?.name ? `Restaurant: ${currentRestaurant.name}` : "Select a restaurant to continue"}
            </div>
          </div>

          <div className="mc-topbar-right">
            <select
              className="mc-select"
              value={currentRestaurant?.id || ""}
              onChange={(e) => onSelectRestaurant(e.target.value)}
            >
              <option value="" disabled>
                {restaurants.length ? "Choose restaurant" : "No restaurants"}
              </option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name || `Restaurant #${r.id}`}
                </option>
              ))}
            </select>

            {/* Botón “New …” estilo imagen (lo conectamos a modales luego) */}
            {view === "ingredients" && (
              <button
                className="mc-cta"
                onClick={() => dispatch({ type: "ui_set", payload: { showIngredientModal: true } })}
              >
                New Ingredient
              </button>
            )}
          </div>
        </header>

        <div className="mc-content">
          {/* VISTA: DASHBOARD */}
          {view === "dashboard" && (
            <>
              <div className="mc-stats">
                <Stat label="Dishes" value={dishes.length} />
                <Stat label="Ingredients" value={ingredients.length} />
                <Stat label="Categories" value={categories.length} />
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
                />
              </div>
            </>
          )}

          {/* VISTA: RESTAURANTS (selector “hub”) */}
          {view === "restaurants" && (
            <section className="mc-panel">
              <div className="mc-panel-head">
                <h3>Your restaurants</h3>
                <button
                  className="mc-cta"
                  onClick={() => dispatch({ type: "ui_set", payload: { showRestaurantModal: true } })}
                >
                  New Restaurant
                </button>
              </div>

              {store.loading.restaurants && <div className="mc-empty">Loading…</div>}
              {store.error.restaurants && <div className="mc-error">{store.error.restaurants}</div>}

              <div className="mc-cards">
                {restaurants.map((r) => (
                  <button key={r.id} className="mc-card" onClick={() => onSelectRestaurant(r.id)}>
                    <div className="mc-card-title">{r.name || `Restaurant #${r.id}`}</div>
                    <div className="mc-card-sub">ID: {r.id}</div>
                  </button>
                ))}
                {!restaurants.length && !store.loading.restaurants && (
                  <div className="mc-empty">Create your first restaurant to start.</div>
                )}
              </div>
            </section>
          )}

          {/* VISTAS: placeholders MVP (los conectamos a tus componentes antiguos en el siguiente paso) */}
          {["ingredients", "categories", "dishes", "profile"].includes(view) && view !== "dashboard" && view !== "restaurants" && (
            <section className="mc-panel">
              <div className="mc-panel-head">
                <h3>{view.toUpperCase()}</h3>
              </div>
              <div className="mc-empty">
                MVP: aquí conectamos el componente real ({view}) dentro del hub.
              </div>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}
