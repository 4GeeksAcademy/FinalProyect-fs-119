// src/front/v2/views/DishesView.jsx
import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import DishList from "../../components/DishList";
// ✅ NUEVO: helper numérico genérico
import { formatNumber } from "../utils/formatters";

export default function DishesView({
  currentRestaurant,
  categories,
  ingredients,
  store,
  dispatch,
}) {
  const dishes = store.dishes || [];

  const [dishMode, setDishMode] = useState("list"); // list | create | detail
  const [dishForm, setDishForm] = useState({
    name: "",
    category_id: "",
    description: "",
  });
  const [dishError, setDishError] = useState("");
  const [dishLoading, setDishLoading] = useState(false);
  const [dishLines, setDishLines] = useState([]);

  const [dishDetail, setDishDetail] = useState(null);
  const [detailError, setDetailError] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);

  const [newLine, setNewLine] = useState({
    ingredient_id: "",
    gross_weight: "",
    decrease_pct: "0",
  });
  const [lineLoading, setLineLoading] = useState(false);
  const [lineError, setLineError] = useState("");

  // Carga de platos al montar / cambiar restaurante
  useEffect(() => {
    if (!currentRestaurant?.id) return;
    let ignore = false;

    (async () => {
      try {
        const data = await api.getDishes(currentRestaurant.id);
        if (ignore) return;
        dispatch({ type: "set_dishes", payload: data.dishes || [] });
      } catch (err) {
        if (ignore) return;
        console.error("Error cargando platos:", err);
        dispatch({
          type: "set_error",
          payload: {
            dishes: err.message || "No se pudieron cargar los platos",
          },
        });
      }
    })();

    return () => {
      ignore = true;
    };
  }, [currentRestaurant?.id, dispatch]);

  const resetDishForm = () => {
    setDishForm({
      name: "",
      category_id: "",
      description: "",
    });
    setDishLines([]);
  };

  const handleDishFieldChange = (field, value) => {
    setDishForm((prev) => ({ ...prev, [field]: value }));
  };

  const addDishLine = () => {
    if (!ingredients.length) {
      alert("Primero crea ingredientes.");
      return;
    }
    setDishLines((prev) => [
      ...prev,
      {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : Date.now() + Math.random(),
        ingredient_id: "",
        gross_weight: "",
        decrease_pct: "0",
      },
    ]);
  };

  const removeDishLine = (id) => {
    setDishLines((prev) => prev.filter((l) => l.id !== id));
  };

  const updateDishLine = (id, patch) => {
    setDishLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...patch } : l))
    );
  };

  const patchDishInStore = (updatedDish) => {
    if (!updatedDish || !updatedDish.id) return;
    dispatch({
      type: "set_dishes",
      payload: (store.dishes || []).map((d) =>
        d.id === updatedDish.id ? { ...d, ...updatedDish } : d
      ),
    });
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
    };

    if (!payload.name) {
      setDishError("El nombre del plato es obligatorio.");
      setDishLoading(false);
      return;
    }

    const validLines = dishLines.filter((l) => {
      if (!l.ingredient_id) return false;
      if (l.gross_weight === "" || isNaN(Number(l.gross_weight))) return false;
      return true;
    });

    try {
      const data = await api.createDish(currentRestaurant.id, payload);
      const created = data?.dish;
      if (!created) throw new Error("No se devolvió el plato creado.");

      const dishId = created.id;

      if (validLines.length) {
        await Promise.all(
          validLines.map((l) =>
            api.addDishIngredient(currentRestaurant.id, dishId, {
              ingredient_id: Number(l.ingredient_id),
              gross_weight: Number(l.gross_weight),
              decrease_pct:
                l.decrease_pct !== "" && !isNaN(Number(l.decrease_pct))
                  ? Number(l.decrease_pct)
                  : 0,
            })
          )
        );
      }

      const listData = await api.getDishes(currentRestaurant.id);
      dispatch({
        type: "set_dishes",
        payload: listData.dishes || [],
      });

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

  const loadDishDetail = async (dishId) => {
    if (!currentRestaurant?.id) return;
    setDetailError("");
    setDetailLoading(true);
    try {
      const data = await api.getDish(currentRestaurant.id, dishId);
      const detail = data?.dish || data;
      setDishDetail(detail || null);

      if (detail && detail.id) {
        patchDishInStore(detail);
      }
    } catch (err) {
      console.error(err);
      setDetailError(err.message || "No se pudo cargar el detalle del plato");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleViewDish = async (dish) => {
    setDishMode("detail");
    setDishDetail(null);
    await loadDishDetail(dish.id);
  };

  const handleNewLineChange = (field, value) => {
    setNewLine((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddLineToDish = async (e) => {
    e.preventDefault();
    if (!currentRestaurant?.id || !dishDetail?.id) return;

    setLineError("");
    const ingredient_id = newLine.ingredient_id
      ? Number(newLine.ingredient_id)
      : null;
    const gross_weight =
      newLine.gross_weight !== "" ? Number(newLine.gross_weight) : NaN;
    const decrease_pct =
      newLine.decrease_pct !== "" ? Number(newLine.decrease_pct) : 0;

    if (!ingredient_id) {
      setLineError("Selecciona un ingrediente.");
      return;
    }
    if (isNaN(gross_weight) || gross_weight <= 0) {
      setLineError("La cantidad debe ser un número mayor que 0.");
      return;
    }

    try {
      setLineLoading(true);
      await api.addDishIngredient(currentRestaurant.id, dishDetail.id, {
        ingredient_id,
        gross_weight,
        decrease_pct: isNaN(decrease_pct) ? 0 : decrease_pct,
      });

      await loadDishDetail(dishDetail.id);

      setNewLine({
        ingredient_id: "",
        gross_weight: "",
        decrease_pct: "0",
      });
    } catch (err) {
      console.error(err);
      setLineError(err.message || "No se pudo añadir el ingrediente");
    } finally {
      setLineLoading(false);
    }
  };

  const detailLines =
    dishDetail?.lines ||
    dishDetail?.dish_ingredients ||
    dishDetail?.ingredients ||
    [];

  const findCategoryName = (category_id) => {
    if (!category_id) return null;
    const cat = categories.find((c) => c.id === category_id);
    return cat ? cat.name : null;
  };

  const currentDishCost = dishDetail?.total_cost ?? dishDetail?.cost_price ?? 0;

  const computeDishAllergens = () => {
    const byId = new Map((ingredients || []).map((i) => [String(i.id), i]));
    const set = new Set();
    let missing = 0;

    for (const line of detailLines || []) {
      const ing =
        line?.ingredient ||
        line?.ingredient_data ||
        byId.get(String(line?.ingredient_id)) ||
        null;

      const text = (ing?.allergens || "").trim();
      if (!text) {
        missing++;
        continue;
      }
      text
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
        .forEach((a) => set.add(a.toLowerCase()));
    }

    return { list: Array.from(set).sort(), missing };
  };

  const dishAllergens = computeDishAllergens();

  return (
    <section className="mc-panel">
      <div className="mc-panel-head">
        {dishMode === "list" && (
          <>
            <h3>Platos</h3>
            <button
              className="mc-cta"
              onClick={() => setDishMode("create")}
              disabled={!currentRestaurant?.id}
            >
              New dish
            </button>
          </>
        )}

        {dishMode === "create" && (
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

        {dishMode === "detail" && (
          <>
            <h3>
              Detalle plato
              {dishDetail?.name ? `: ${dishDetail.name}` : ""}
            </h3>
            <button
              type="button"
              className="mc-ghost"
              onClick={() => {
                setDishMode("list");
                setDishDetail(null);
                setNewLine({
                  ingredient_id: "",
                  gross_weight: "",
                  decrease_pct: "0",
                });
                setLineError("");
              }}
            >
              ← Volver al listado
            </button>
          </>
        )}
      </div>

      {dishMode === "list" && (
        <>
          {store.loading.dishes && (
            <div className="mc-empty">Cargando platos…</div>
          )}
          {store.error.dishes && (
            <div className="mc-error">{store.error.dishes}</div>
          )}

          {!store.loading.dishes && (!dishes || dishes.length === 0) && (
            <div className="mc-empty">
              Aún no tienes platos en este restaurante.
            </div>
          )}

          {dishes && dishes.length > 0 && (
            <DishList
              dishes={dishes}
              categories={categories}
              onDelete={handleDeleteDish}
              onView={handleViewDish}
            />
          )}
        </>
      )}

      {dishMode === "create" && (
        <form className="mc-form" onSubmit={handleDishSubmit}>
          {dishError && <div className="mc-error">{dishError}</div>}

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

          <div className="mc-form-row">
            <div className="d-flex justify-content-between align-items-center">
              <label>Ingredientes del plato</label>
              <button
                type="button"
                className="mc-cta mc-cta-secondary"
                onClick={addDishLine}
                disabled={!ingredients.length}
              >
                + Añadir ingrediente
              </button>
            </div>

            {!ingredients.length && (
              <div className="mc-muted small mt-1">
                Primero crea ingredientes en la vista Ingredients.
              </div>
            )}

            {dishLines.length === 0 && ingredients.length > 0 && (
              <div className="mc-empty">
                No has añadido ingredientes aún.
              </div>
            )}

            {dishLines.length > 0 && (
              <div className="mc-di-lines">
                {dishLines.map((line) => (
                  <div
                    key={line.id}
                    className="mc-di-line d-flex gap-2 align-items-end mb-2"
                  >
                    <div className="flex-grow-1">
                      <label className="mc-field">
                        <span>Ingrediente</span>
                        <select
                          className="mc-input"
                          value={line.ingredient_id}
                          onChange={(e) =>
                            updateDishLine(line.id, {
                              ingredient_id: e.target.value,
                            })
                          }
                        >
                          <option value="">Selecciona…</option>
                          {ingredients.map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.name} — {i.price_per_unit} / {i.unit}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div>
                      <label className="mc-field">
                        <span>Cantidad bruta</span>
                        <input
                          className="mc-input"
                          type="number"
                          min="0"
                          step="0.0001"
                          value={line.gross_weight}
                          onChange={(e) =>
                            updateDishLine(line.id, {
                              gross_weight: e.target.value,
                            })
                          }
                          placeholder="Ej: 150"
                        />
                      </label>
                    </div>

                    <div>
                      <label className="mc-field">
                        <span>Merma %</span>
                        <input
                          className="mc-input"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={line.decrease_pct}
                          onChange={(e) =>
                            updateDishLine(line.id, {
                              decrease_pct: e.target.value,
                            })
                          }
                          placeholder="0"
                        />
                      </label>
                    </div>

                    <button
                      type="button"
                      className="mc-link-danger"
                      onClick={() => removeDishLine(line.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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
            <button type="submit" className="mc-cta" disabled={dishLoading}>
              {dishLoading ? "Creando..." : "Crear plato"}
            </button>
          </div>
        </form>
      )}

      {dishMode === "detail" && (
        <div className="mc-dish-detail">
          {detailLoading && (
            <div className="mc-empty">Cargando detalle…</div>
          )}
          {detailError && <div className="mc-error">{detailError}</div>}
          {dishDetail && !detailLoading && (
            <>
              <div className="mc-dish-header">
                <h4>{dishDetail.name}</h4>
                <div className="mc-muted">
                  {findCategoryName(dishDetail.category_id) && (
                    <span>
                      Categoría: {findCategoryName(dishDetail.category_id)}
                    </span>
                  )}
                </div>

                {/* ✅ COSTE GRANDE, SIN BADGE, CON 2 DECIMALES */}
                <div className="mc-dish-cost">
                  Coste total:{" "}
                  <span className="mc-dish-cost-value">
                    {formatNumber(currentDishCost)} €
                  </span>
                </div>

                {dishDetail.description && (
                  <p className="mt-2">{dishDetail.description}</p>
                )}

                <div className="mt-3">
                  <div className="mc-muted" style={{ marginBottom: 6 }}>
                    Alérgenos del plato:
                  </div>
                  {dishAllergens.list.length ? (
                    <div className="d-flex flex-wrap gap-2">
                      {dishAllergens.list.map((a) => (
                        <span
                          key={a}
                          className="badge bg-warning text-dark"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="mc-muted">
                      No hay alérgenos registrados (o faltan datos).
                    </div>
                  )}
                  {dishAllergens.missing > 0 && (
                    <div className="mc-muted" style={{ marginTop: 6 }}>
                      Nota: {dishAllergens.missing} ingrediente(s) sin
                      alérgenos en su ficha.
                    </div>
                  )}
                </div>
              </div>

              <hr />

              <div className="mc-dish-lines">
                <h5>Ingredientes del plato</h5>

                {detailLines.length === 0 && (
                  <div className="mc-empty">
                    Este plato todavía no tiene ingredientes asociados.
                  </div>
                )}

                {detailLines.length > 0 && (
                  <div className="mc-table">
                    <div className="mc-tr mc-th">
                      <div className="mc-td">Ingrediente</div>
                      <div className="mc-td">Cantidad</div>
                      <div className="mc-td">Merma %</div>
                      <div className="mc-td">Coste línea</div>
                    </div>
                    {detailLines.map((line, idx) => {
                      const ing =
                        line.ingredient || line.ingredient_data || null;
                      const name =
                        ing?.name ||
                        line.ingredient_name ||
                        `#${line.ingredient_id}`;
                      const unit = ing?.unit || line.unit || "";
                      const qtyRaw = line.gross_weight ?? line.qty ?? 0;
                      const decRaw = line.decrease_pct ?? line.merma_pct ?? 0;
                      const lineCostRaw =
                        line.ingredient_cost ??
                        line.line_cost ??
                        line.cost ??
                        0;

                      const qty = formatNumber(qtyRaw);
                      const dec = formatNumber(decRaw);
                      const lineCost = formatNumber(lineCostRaw);

                      return (
                        <div key={idx} className="mc-tr">
                          <div className="mc-td">{name}</div>
                          <div className="mc-td">
                            {qty} {unit}
                          </div>
                          <div className="mc-td">{dec} %</div>
                          <div className="mc-td">{lineCost} €</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <hr />

              <div className="mc-dish-add-line">
                <h5>Añadir ingrediente</h5>

                {lineError && (
                  <div className="mc-error mb-2">{lineError}</div>
                )}

                <form
                  className="mc-form-inline"
                  onSubmit={handleAddLineToDish}
                >
                  <div className="mc-form-row d-flex gap-2 flex-wrap">
                    <div style={{ minWidth: 200, flex: "1 1 auto" }}>
                      <label className="mc-field">
                        <span>Ingrediente</span>
                        <select
                          className="mc-input"
                          value={newLine.ingredient_id}
                          onChange={(e) =>
                            handleNewLineChange(
                              "ingredient_id",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Selecciona…</option>
                          {ingredients.map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.name} — {i.price_per_unit} / {i.unit}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div style={{ minWidth: 120 }}>
                      <label className="mc-field">
                        <span>Cantidad bruta</span>
                        <input
                          className="mc-input"
                          type="number"
                          min="0"
                          step="0.0001"
                          value={newLine.gross_weight}
                          onChange={(e) =>
                            handleNewLineChange(
                              "gross_weight",
                              e.target.value
                            )
                          }
                        />
                      </label>
                    </div>

                    <div style={{ minWidth: 120 }}>
                      <label className="mc-field">
                        <span>Merma %</span>
                        <input
                          className="mc-input"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={newLine.decrease_pct}
                          onChange={(e) =>
                            handleNewLineChange(
                              "decrease_pct",
                              e.target.value
                            )
                          }
                        />
                      </label>
                    </div>

                    <div className="d-flex align-items-end">
                      <button
                        type="submit"
                        className="mc-cta"
                        disabled={lineLoading}
                      >
                        {lineLoading
                          ? "Añadiendo..."
                          : "Añadir ingrediente"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
