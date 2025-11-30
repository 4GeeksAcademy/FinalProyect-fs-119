// src/front/v2/components/MasterCard.jsx
import React, { useState, useEffect } from "react";
import "./mastercard.css";
import { api } from "../services/api";

import CategoryList from "../../pages/CategoryList";
import IngredientList from "../../pages/IngredientList";
import DishList from "../../components/DishList";

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

function Table({ title, columns, rows, footer, actions }) {
  return (
    <section className="mc-panel">
      <div className="mc-panel-head">
        <h3>{title}</h3>
        {actions}
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

export default function MasterCard({ store, dispatch }) {
  // --- modos de vista secundarios ---
  const [catMode, setCatMode] = useState("list"); // list | create
  const [ingMode, setIngMode] = useState("list"); // list | create

  // --- formulario categorías ---
  const [catName, setCatName] = useState("");
  const [catImage, setCatImage] = useState("");

  // --- formulario ingredientes ---
  const [ingForm, setIngForm] = useState({
    name: "",
    unit: "g",
    price_per_unit: "",
    image_url: "",
  });

  // --- estado global / store ---
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

  // ---------- ESTADO LOCAL PARA PLATOS ----------
  const [dishMode, setDishMode] = useState("list"); // "list" | "create"
  const [dishForm, setDishForm] = useState({
    name: "",
    category_id: "",
    description: "",
  });
  const [dishError, setDishError] = useState("");
  const [dishLoading, setDishLoading] = useState(false);
  const [dishLines, setDishLines] = useState([]);
  // -------------------------------------------

  // Helpers dashboard
  const topDishesRows = dishes.slice(0, 5).map((d) => [d.name || `Dish #${d.id}`, "—"]);
  const alertsRows = ingredients
    .filter((i) => i.price_per_unit == null || Number(i.price_per_unit) === 0)
    .slice(0, 5)
    .map((i) => [i.name || `Ingredient #${i.id}`, "No Cost"]);

  // Cuando entro en Dishes y tengo restaurante, cargo lista de platos
  useEffect(() => {
    if (view !== "dishes" || !currentRestaurant?.id) return;

    (async () => {
      try {
        const data = await api.getDishes(currentRestaurant.id);
        dispatch({ type: "set_dishes", payload: data.dishes || [] });
      } catch (err) {
        console.error("Error cargando platos:", err);
        dispatch({
          type: "set_error",
          payload: { dishes: err.message || "No se pudieron cargar los platos" },
        });
      }
    })();
  }, [view, currentRestaurant?.id, dispatch]);

  // Si salgo de Dishes, reseteo modo/errores y formulario
  const resetDishLines = () => setDishLines([]);

  const resetDishForm = () => {
    setDishForm({
      name: "",
      category_id: "",
      description: "",
    });
    resetDishLines();
  };

  useEffect(() => {
    if (view !== "dishes") {
      setDishMode("list");
      setDishError("");
      setDishLoading(false);
      resetDishForm();
    }
  }, [view]);

  // --- CATEGORIES HANDLERS (MVP) ---
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!currentRestaurant?.id) return;
    const name = catName.trim();
    if (!name) return;

    try {
      dispatch({ type: "set_loading", payload: { categories: true } });
      const payload = { name, image_url: catImage.trim() || null };
      const data = await api.createCategory(currentRestaurant.id, payload);
      const created = data?.categoria || data?.category;

      const updated = created ? [...categories, created] : categories;
      dispatch({
        type: "merge_currentRestaurant",
        payload: { categories: updated },
      });

      setCatName("");
      setCatImage("");
      setCatMode("list");
    } catch (err) {
      console.error(err);
      dispatch({
        type: "set_error",
        payload: { categories: err.message || "Error creando categoría" },
      });
    } finally {
      dispatch({ type: "set_loading", payload: { categories: false } });
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!currentRestaurant?.id) return;
    try {
      await api.deleteCategory(currentRestaurant.id, id);
      const updated = categories.filter((c) => c.id !== id);
      dispatch({
        type: "merge_currentRestaurant",
        payload: { categories: updated },
      });
    } catch (err) {
      console.error(err);
    }
  };

  // --- INGREDIENTS HANDLERS (MVP) ---
  const handleChangeIng = (e) => {
    const { name, value } = e.target;
    setIngForm((prev) => ({ ...prev, [name]: value }));
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
      });
      setIngMode("list");
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

  // --- DISHES HANDLERS (MVP) ---
  const handleDishFieldChange = (field, value) => {
    setDishForm((prev) => ({ ...prev, [field]: value }));
  };

  const addDishLine = () => {
    setDishLines((prev) => [
      ...prev,
      {
        tmpId: Date.now() + Math.random(),
        ingredient_id: "",
        gross_weight: "",
        decrease_pct: "",
      },
    ]);
  };

  const updateDishLine = (tmpId, patch) => {
    setDishLines((prev) =>
      prev.map((l) => (l.tmpId === tmpId ? { ...l, ...patch } : l))
    );
  };

  const removeDishLine = (tmpId) => {
    setDishLines((prev) => prev.filter((l) => l.tmpId !== tmpId));
  };

  const handleDishSubmit = async (e) => {
    e.preventDefault();
    if (!currentRestaurant?.id) return;

    setDishError("");
    setDishLoading(true);

    const payload = {
      name: dishForm.name.trim(),
      category_id: dishForm.category_id ? Number(dishForm.category_id) : null,
      description: dishForm.description.trim() || null,
      // cost_price e image_url NO se envían: las calcula/gestionará el back
    };

    if (!payload.name) {
      setDishError("El nombre del plato es obligatorio.");
      setDishLoading(false);
      return;
    }

    // Líneas activas: las que tienen ingrediente y cantidad
    const activeLines = (dishLines || []).filter(
      (l) => l.ingredient_id && l.gross_weight !== ""
    );

    try {
      // 1) Crear plato
      const data = await api.createDish(currentRestaurant.id, payload);
      const created = data?.dish;
      if (!created || !created.id) {
        throw new Error("No se pudo crear el plato en el servidor");
      }
      const dishId = created.id;

      // 2) Crear líneas de DishIngredient
      for (const line of activeLines) {
        const linePayload = {
          ingredient_id: Number(line.ingredient_id),
          gross_weight: Number(line.gross_weight),
          decrease_pct:
            line.decrease_pct !== "" ? Number(line.decrease_pct) : 0,
        };

        await api.addDishIngredient(
          currentRestaurant.id,
          dishId,
          linePayload
        );
      }

      // 3) Refrescar plato desde el backend (para traer coste calculado)
      let finalDish = created;
      try {
        const refreshed = await api.getDish(currentRestaurant.id, dishId);
        if (refreshed?.dish) finalDish = refreshed.dish;
      } catch (innerErr) {
        console.warn("No se pudo refrescar el plato, se usa el creado:", innerErr);
      }

      // 4) Actualizar store
      dispatch({ type: "add_dish", payload: finalDish });

      // 5) Limpiar
      resetDishForm();
      setDishMode("list");
    } catch (err) {
      console.error(err);
      setDishError(err.message || "Error creando plato");
    } finally {
      setDishLoading(false);
    }
  };

  const handleDeleteDish = async (dishId) => {
    if (!currentRestaurant?.id) return;
    try {
      await api.deleteDish(currentRestaurant.id, dishId);
      dispatch({ type: "remove_dish", payload: dishId });
    } catch (err) {
      alert(err.message || "Error al eliminar plato");
    }
  };

  const handleViewDish = (dish) => {
    // MVP: de momento solo mostramos algo simple; luego esto será /app/dishes/:id
    alert(`Plato: ${dish.name}\nCoste: ${dish.cost_price ?? dish.total_cost ?? 0}`);
  };

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
                ["dashboard", "dishes", "ingredients", "categories"].includes(
                  item.key
                ) && !currentRestaurant?.id
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
              {currentRestaurant?.name
                ? `Restaurant: ${currentRestaurant.name}`
                : "Select a restaurant to continue"}
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

            {/* CTA contextual por vista */}
            {view === "ingredients" && ingMode === "list" && (
              <button
                className="mc-cta"
                onClick={() => setIngMode("create")}
              >
                New Ingredient
              </button>
            )}
            {view === "ingredients" && ingMode === "create" && (
              <button
                className="mc-cta mc-cta-secondary"
                onClick={() => setIngMode("list")}
              >
                Cancel
              </button>
            )}

            {view === "categories" && catMode === "list" && (
              <button
                className="mc-cta"
                onClick={() => setCatMode("create")}
              >
                New Category
              </button>
            )}
            {view === "categories" && catMode === "create" && (
              <button
                className="mc-cta mc-cta-secondary"
                onClick={() => setCatMode("list")}
              >
                Cancel
              </button>
            )}
          </div>
        </header>

        <div className="mc-content">
          {/* DASHBOARD */}
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

          {/* RESTAURANTS */}
          {view === "restaurants" && (
            <section className="mc-panel">
              <div className="mc-panel-head">
                <h3>Your restaurants</h3>
              </div>

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
                          {r.direccion}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
                {!restaurants.length &&
                  !store.loading.restaurants && (
                    <div className="mc-empty">
                      Create your first restaurant to start.
                    </div>
                  )}
              </div>
            </section>
          )}

          {/* CATEGORIES */}
          {view === "categories" && (
            <section className="mc-panel">
              {catMode === "list" && (
                <>
                  <div className="mc-panel-head">
                    <h3>Categories</h3>
                  </div>
                  {store.loading.categories && (
                    <div className="mc-empty">Loading…</div>
                  )}
                  {store.error.categories && (
                    <div className="mc-error">{store.error.categories}</div>
                  )}
                  <CategoryList
                    categories={categories}
                    onDelete={handleDeleteCategory}
                  />
                </>
              )}

              {catMode === "create" && (
                <form
                  className="mc-form"
                  onSubmit={handleCreateCategory}
                  style={{ maxWidth: 420 }}
                >
                  <h3 className="mc-form-title">New Category</h3>
                  <label className="mc-field">
                    <span>Name</span>
                    <input
                      type="text"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      required
                    />
                  </label>
                  <label className="mc-field">
                    <span>Image URL (optional)</span>
                    <input
                      type="text"
                      value={catImage}
                      onChange={(e) => setCatImage(e.target.value)}
                    />
                  </label>

                  <div className="mc-form-actions">
                    <button
                      type="button"
                      className="mc-btn-secondary"
                      onClick={() => setCatMode("list")}
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
          )}

          {/* INGREDIENTS */}
          {view === "ingredients" && (
            <section className="mc-panel">
              {ingMode === "list" && (
                <>
                  <Table
                    title="Ingredients"
                    columns={["Name", "Unit", "Price / unit", "Actions"]}
                    rows={
                      ingredients.length
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
                        : []
                    }
                  />
                </>
              )}

              {ingMode === "create" && (
                <form
                  className="mc-form"
                  onSubmit={handleCreateIngredient}
                  style={{ maxWidth: 500 }}
                >
                  <h3 className="mc-form-title">New Ingredient</h3>

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

                  <div className="mc-form-actions">
                    <button
                      type="button"
                      className="mc-btn-secondary"
                      onClick={() => setIngMode("list")}
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
          )}

          {/* DISHES */}
          {view === "dishes" && (
            <section className="mc-panel">
              <div className="mc-panel-head">
                {dishMode === "list" ? (
                  <>
                    <h3>Platos</h3>
                    <button
                      className="mc-cta"
                      onClick={() => {
                        setDishMode("create");
                        setDishError("");
                        setDishLines((prev) =>
                          prev.length
                            ? prev
                            : [
                                {
                                  tmpId: Date.now() + Math.random(),
                                  ingredient_id: "",
                                  gross_weight: "",
                                  decrease_pct: "",
                                },
                              ]
                        );
                      }}
                      disabled={!currentRestaurant?.id}
                    >
                      New dish
                    </button>
                  </>
                ) : (
                  <>
                    <h3>Nuevo plato</h3>
                    <button
                      type="button"
                      className="mc-ghost"
                      onClick={() => {
                        resetDishForm();
                        setDishMode("list");
                      }}
                    >
                      ← Volver al listado
                    </button>
                  </>
                )}
              </div>

              {dishMode === "list" ? (
                <>
                  {store.loading.dishes && (
                    <div className="mc-empty">Cargando platos…</div>
                  )}
                  {store.error.dishes && (
                    <div className="mc-error">{store.error.dishes}</div>
                  )}

                  {!store.loading.dishes &&
                    (!dishes || dishes.length === 0) && (
                      <div className="mc-empty">
                        Aún no tienes platos en este restaurante.
                      </div>
                    )}

                  {dishes && dishes.length > 0 && (
                    <DishList
                      dishes={dishes}
                      onDelete={handleDeleteDish}
                      onView={handleViewDish}
                    />
                  )}
                </>
              ) : (
                <form className="mc-form" onSubmit={handleDishSubmit}>
                  {dishError && <div className="mc-error">{dishError}</div>}

                  {/* Nombre */}
                  <div className="mc-form-row">
                    <label>Nombre del plato *</label>
                    <input
                      className="mc-input"
                      value={dishForm.name}
                      onChange={(e) =>
                        handleDishFieldChange("name", e.target.value)
                      }
                      placeholder="Ej: Paella de marisco"
                      required
                    />
                  </div>

                  {/* Categoría opcional */}
                  <div className="mc-form-row">
                    <label>Categoría (opcional)</label>
                    <select
                      className="mc-input"
                      value={dishForm.category_id}
                      onChange={(e) =>
                        handleDishFieldChange("category_id", e.target.value)
                      }
                    >
                      <option value="">Sin categoría</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Descripción */}
                  <div className="mc-form-row">
                    <label>Descripción (opcional)</label>
                    <textarea
                      className="mc-input"
                      rows={3}
                      value={dishForm.description}
                      onChange={(e) =>
                        handleDishFieldChange("description", e.target.value)
                      }
                      placeholder="Breve descripción del plato"
                    />
                  </div>

                  <hr />

                  {/* INGREDIENTES DEL PLATO */}
                  <h4>Ingredientes del plato</h4>
                  <p className="mc-muted">
                    Selecciona ingredientes ya creados y define la cantidad
                    (gross qty) y la merma (%). El coste lo calcula el backend.
                  </p>

                  <div className="mc-lines">
                    {dishLines.length === 0 && (
                      <div className="mc-empty">
                        Aún no has añadido líneas de ingredientes.
                      </div>
                    )}

                    {dishLines.map((line) => (
                      <div
                        key={line.tmpId}
                        className="mc-line-row"
                      >
                        <div className="mc-line-main">
                          <select
                            className="mc-input"
                            value={line.ingredient_id || ""}
                            onChange={(e) =>
                              updateDishLine(line.tmpId, {
                                ingredient_id: e.target.value,
                              })
                            }
                          >
                            <option value="">Ingrediente…</option>
                            {ingredients.map((ing) => (
                              <option key={ing.id} value={ing.id}>
                                {ing.name} — {ing.price_per_unit} / {ing.unit}
                              </option>
                            ))}
                          </select>

                          <input
                            className="mc-input"
                            type="number"
                            step="0.0001"
                            placeholder="Cantidad (g/ml/ud)"
                            value={line.gross_weight}
                            onChange={(e) =>
                              updateDishLine(line.tmpId, {
                                gross_weight: e.target.value,
                              })
                            }
                          />

                          <input
                            className="mc-input"
                            type="number"
                            step="0.01"
                            placeholder="Merma %"
                            value={line.decrease_pct}
                            onChange={(e) =>
                              updateDishLine(line.tmpId, {
                                decrease_pct: e.target.value,
                              })
                            }
                          />
                        </div>

                        <button
                          type="button"
                          className="mc-link-danger"
                          onClick={() => removeDishLine(line.tmpId)}
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="mc-ghost"
                    onClick={addDishLine}
                  >
                    + Añadir ingrediente
                  </button>

                  <div className="mc-form-actions">
                    <button
                      type="button"
                      className="mc-ghost"
                      onClick={() => {
                        resetDishForm();
                        setDishMode("list");
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="mc-cta"
                      disabled={dishLoading}
                    >
                      {dishLoading ? "Creando..." : "Crear plato"}
                    </button>
                  </div>
                </form>
              )}
            </section>
          )}

          {/* PROFILE placeholder (MVP) */}
          {view === "profile" && (
            <section className="mc-panel">
              <div className="mc-panel-head">
                <h3>PROFILE</h3>
              </div>
              <div className="mc-empty">
                MVP: aquí conectamos el perfil dentro del hub.
              </div>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}
