// src/front/v2/views/RestaurantView.jsx
import React from "react";

export default function RestaurantView({
  restaurants,
  store,
  showCreateRest,
  setShowCreateRest,
  restForm,
  restLoading,
  restError,
  onChangeRestField,
  onSubmitCreateRest,
  onSelectRestaurant,
  openInMaps,
}) {
  return (
    <section className="mc-panel">
      <div className="mc-panel-head">
        <h3>Your restaurants</h3>
        {!showCreateRest && (
          <button
            type="button"
            className="mc-cta"
            onClick={() => setShowCreateRest(true)}
          >
            New restaurant
          </button>
        )}
        {showCreateRest && (
          <button
            type="button"
            className="mc-cta mc-cta-secondary"
            onClick={() => {
              setShowCreateRest(false);
              // limpiamos error desde fuera pasando mismo setter
            }}
          >
            Cancel
          </button>
        )}
      </div>

      {restError && <div className="mc-error mb-2">{restError}</div>}

      {showCreateRest && (
        <form
          className="mc-form"
          onSubmit={onSubmitCreateRest}
          style={{ maxWidth: 480, marginBottom: "2rem" }}
        >
          <label className="mc-field">
            <span>Nombre del restaurante *</span>
            <input
              className="mc-input"
              value={restForm.name}
              onChange={(e) => onChangeRestField("name", e.target.value)}
              required
            />
          </label>

          <label className="mc-field">
            <span>Teléfono (opcional)</span>
            <input
              className="mc-input"
              value={restForm.telefono}
              onChange={(e) => onChangeRestField("telefono", e.target.value)}
            />
          </label>

          <label className="mc-field">
            <span>Dirección (opcional)</span>
            <input
              className="mc-input"
              value={restForm.direccion}
              onChange={(e) => onChangeRestField("direccion", e.target.value)}
            />
          </label>

          <div className="mc-form-actions">
            <button type="submit" className="mc-cta" disabled={restLoading}>
              {restLoading ? "Creando..." : "Crear y abrir en dashboard"}
            </button>
          </div>
        </form>
      )}

      {store.loading.restaurants && (
        <div className="mc-empty">Loading…</div>
      )}
      {store.error.restaurants && (
        <div className="mc-error">{store.error.restaurants}</div>
      )}

      <div className="mc-cards">
        {restaurants.map((r) => (
          <button
            key={r.id}
            className="mc-card"
            onClick={() => onSelectRestaurant(r.id)}
          >
            <div className="mc-card-avatar">
              {(r.name || "R")[0].toUpperCase()}
            </div>
            <div className="mc-card-body">
              <div className="mc-card-title">
                {r.name || `Restaurant #${r.id}`}
              </div>
              {r.direccion && (
                <div className="mc-card-sub mc-card-sub--muted">
                  <span
                    className="mc-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      openInMaps(r.direccion);
                    }}
                  >
                    {r.direccion}
                  </span>
                </div>
              )}
            </div>
          </button>
        ))}
        {!restaurants.length && !store.loading.restaurants && (
          <div className="mc-empty">
            Create your first restaurant to start.
          </div>
        )}
      </div>
    </section>
  );
}
