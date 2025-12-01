// src/front/v2/views/IngredientsView.jsx
import React, { useState } from "react";
import { api } from "../services/api";
import { apiFetch } from "../services/apiClient";
import { formatNumber } from "../utils/formatters";

function Table({ title, columns, rows, footer }) {
  return (
    <section className="mc-panel-inner">
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

export default function IngredientsView({
  currentRestaurant,
  ingredients,
  store,
  dispatch,
}) {
  const [mode, setMode] = useState("list"); // list | create

  const [ingForm, setIngForm] = useState({
    name: "",
    unit: "g",
    price_per_unit: "",
    image_url: "",
    allergens: "",
    
  });

  const [ofQuery, setOfQuery] = useState("");
  const [ofResults, setOfResults] = useState([]);
  const [ofLoading, setOfLoading] = useState(false);
  const [ofError, setOfError] = useState("");

  const handleChangeIng = (e) => {
    const { name, value } = e.target;
    setIngForm((prev) => ({ ...prev, [name]: value }));
  };

  const normalizeAllergensText = (value) => {
    if (!value) return "";
    const items = Array.isArray(value)
      ? value
      : String(value)
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);

    const seen = new Set();
    const out = [];
    for (const it0 of items) {
      const it = String(it0).replace("-", " ").trim();
      const key = it.toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(it);
    }
    return out.join(", ");
  };

  const fillFromOpenFood = (p) => {
    const name = p?.name || "";
    const labels = Array.isArray(p?.allergen_labels) ? p.allergen_labels : [];
    const allergens = normalizeAllergensText(labels);

    setIngForm((prev) => ({
      ...prev,
      name: prev.name || name,
      allergens,
    }));
  };

  const runOpenFoodSearch = async () => {
    const q = (ofQuery || "").trim();
    if (!q) return;

    setOfError("");
    setOfLoading(true);
    try {
      const data = await apiFetch(
        `/api/openfood/search?q=${encodeURIComponent(q)}`,
        { method: "GET" }
      );
      setOfResults(Array.isArray(data?.results) ? data.results : []);
    } catch (err) {
      setOfError(err.message || "Error buscando en OpenFoodFacts");
      setOfResults([]);
    } finally {
      setOfLoading(false);
    }
  };


  const handleCreateIngredient = async (e) => {
    e.preventDefault();
    if (!currentRestaurant?.id) return;

    const name = ingForm.name.trim();
    if (!name) return;

    const payload = {
      name,
      unit: ingForm.unit || "g",
      price_per_unit:
        ingForm.price_per_unit !== "" ? Number(ingForm.price_per_unit) : 0,
      image_url: ingForm.image_url.trim() || null,
      allergens: ingForm.allergens.trim() || null,
    };

    try {
      dispatch({ type: "set_loading", payload: { ingredients: true } });
      const data = await api.createIngredient(currentRestaurant.id, payload);
      const created = data?.ingrediente || data?.ingredient;

      const updated = created ? [...ingredients, created] : ingredients;
      dispatch({
        type: "merge_currentRestaurant",
        payload: { ingredients: updated },
      });

      setIngForm({
        name: "",
        unit: "g",
        price_per_unit: "",
        image_url: "",
        allergens: "",
        barcode: "",
      });
      setOfQuery("");
      setOfResults([]);
      setOfError("");
      setMode("list");
    } catch (err) {
      console.error(err);
      dispatch({
        type: "set_error",
        payload: { ingredients: err.message || "Error creando ingrediente" },
      });
    } finally {
      dispatch({ type: "set_loading", payload: { ingredients: false } });
    }
  };

  const handleDeleteIngredient = async (id) => {
    if (!currentRestaurant?.id) return;
    try {
      await api.deleteIngredient(currentRestaurant.id, id);
      const updated = ingredients.filter((i) => i.id !== id);
      dispatch({
        type: "merge_currentRestaurant",
        payload: { ingredients: updated },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const listRows =
    ingredients && ingredients.length
      ? ingredients.map((ing) => [
          ing.name,
          ing.unit,
          ing.price_per_unit,
          <button
            key={ing.id}
            className="mc-link-danger"
            type="button"
            onClick={() => handleDeleteIngredient(ing.id)}
          >
            Delete
          </button>,
        ])
      : [];

  return (
    <section className="mc-panel">
      <div className="mc-panel-head">
        <h3>Ingredients</h3>
        {mode === "list" && (
          <button className="mc-cta" onClick={() => setMode("create")}>
            New Ingredient
          </button>
        )}
        {mode === "create" && (
          <button
            className="mc-cta mc-cta-secondary"
            onClick={() => setMode("list")}
          >
            Cancel
          </button>
        )}
      </div>

      {mode === "list" && (
        <Table
          title="Ingredients"
          columns={["Name", "Unit", "Price / unit", "Actions"]}
          rows={listRows}
          footer={
            <div className="mc-muted">
              Consejo: si falta “No Allergens”, edítalo recreándolo por ahora
              (MVP). Luego metemos un PUT.
            </div>
          }
        />
      )}

      {mode === "create" && (
        <form
          className="mc-form"
          onSubmit={handleCreateIngredient}
          style={{ maxWidth: 500 }}
        >
          <h3 className="mc-form-title">New Ingredient</h3>

          {/* OpenFood helper */}
          <div className="mc-panel" style={{ padding: "12px" }}>
            <div
              className="mc-panel-head"
              style={{ padding: 0, marginBottom: 8 }}
            >
              <h3 style={{ margin: 0, fontSize: 14 }}>
                Buscar alérgenos (OpenFoodFacts)
              </h3>
              <div className="mc-muted" style={{ fontSize: 12 }}>
                Usa botón (evita rate limit).
              </div>
            </div>

            <div className="mc-field-grid">
              <label className="mc-field">
                <span>Buscar por nombre</span>
                <input
                  type="text"
                  value={ofQuery}
                  onChange={(e) => setOfQuery(e.target.value)}
                  placeholder="leche, galletas…"
                />
              </label>

              <div className="d-flex align-items-end">
                <button
                  type="button"
                  className="mc-cta mc-cta-secondary"
                  onClick={runOpenFoodSearch}
                  disabled={ofLoading || !(ofQuery || "").trim()}
                >
                  {ofLoading ? "Buscando..." : "Buscar"}
                </button>
              </div>
            </div>


            {ofError && (
              <div className="mc-error" style={{ marginTop: 8 }}>
                {ofError}
              </div>
            )}

            {ofResults.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div className="mc-muted" style={{ fontSize: 12 }}>
                  Selecciona un producto:
                </div>

                <div className="mc-table" style={{ marginTop: 6 }}>
                  <div className="mc-tr mc-th">
                    <div className="mc-td">Producto</div>
                    <div className="mc-td">Alérgenos</div>
                    <div className="mc-td">Acción</div>
                  </div>

                  {ofResults.slice(0, 6).map((r) => (
                    <div key={r.code || r.name} className="mc-tr">
                      <div className="mc-td">
                        {r.name || "Sin nombre"}
                        {r.brand ? (
                          <div className="mc-muted" style={{ fontSize: 12 }}>
                            {r.brand}
                          </div>
                        ) : null}
                      </div>
                      <div className="mc-td">
                        {(r.allergen_labels || []).join(", ") || (
                          <span className="mc-muted">Sin datos</span>
                        )}
                      </div>
                      <div className="mc-td">
                        <button
                          type="button"
                          className="mc-cta mc-cta-small"
                          onClick={() => fillFromOpenFood(r)}
                        >
                          Usar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <label className="mc-field">
            <span>Name</span>
            <input
              name="name"
              type="text"
              value={ingForm.name}
              onChange={handleChangeIng}
              required
            />
          </label>

          <div className="mc-field-grid">
            <label className="mc-field">
              <span>Unit</span>
              <select
                name="unit"
                value={ingForm.unit}
                onChange={handleChangeIng}
              >
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="l">l</option>
                <option value="ud">ud</option>
              </select>
            </label>

            <label className="mc-field">
              <span>Price per unit</span>
              <input
                name="price_per_unit"
                type="number"
                step="0.0001"
                value={ingForm.price_per_unit}
                onChange={handleChangeIng}
              />
            </label>
          </div>

          <label className="mc-field">
            <span>Image URL (optional)</span>
            <input
              name="image_url"
              type="text"
              value={ingForm.image_url}
              onChange={handleChangeIng}
            />
          </label>

          <label className="mc-field">
            <span>Allergens (opcional)</span>
            <input
              name="allergens"
              type="text"
              value={ingForm.allergens}
              onChange={handleChangeIng}
              placeholder="gluten, milk, nuts"
            />
          </label>

          <div className="mc-form-actions">
            <button
              type="button"
              className="mc-btn-secondary"
              onClick={() => setMode("list")}
            >
              Cancel
            </button>
            <button type="submit" className="mc-cta">
              Save
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
