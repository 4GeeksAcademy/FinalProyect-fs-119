import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import CreateIngredientModal from "../components/CreateIngredientModal";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "";

async function fetchJson(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, opts);
  const data = await res.json().catch(() => null);
  return { ok: res.ok, data, res };
}

export function ViewDishModal({
  show,
  onClose,
  restaurantId,
  dishId,
  existingIngredients = [],
  onUpdateExistingIngredients,
}) {
  const [dish, setDish] = useState(null);
  const [lines, setLines] = useState([]);
  const [showAddIngModal, setShowAddIngModal] = useState(false);

  const reloadDish = async () => {
    if (!dishId || !restaurantId) return;
    const r = await fetchJson(
      `/api/restaurant/${restaurantId}/dishes/${dishId}`
    );
    const d = r.data?.dish || null;
    setDish(d);
    setLines(d?.ingredients || []);
  };

  useEffect(() => {
    if (!show || !dishId || !restaurantId) return;
    reloadDish();
  }, [show, dishId, restaurantId]);

  const handleSaveIngredientLine = async (ingredientData) => {
    if (!restaurantId || !dishId) return { ok: false };

    const ingRes = await fetchJson(
      `/api/restaurant/${restaurantId}/ingredients`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ingredientData),
      }
    );
    const newIng =
      ingRes.data?.ingrediente || ingRes.data?.ingredient || ingRes.data;
    if (!ingRes.ok || !newIng?.id) {
      alert(ingRes.data?.msg || "Error creando ingrediente");
      return { ok: false };
    }

    if (onUpdateExistingIngredients) {
      onUpdateExistingIngredients((prev) => [...prev, newIng]);
    }

    const unitLabel =
      newIng.unit === "g" || newIng.unit === "kg"
        ? "gramos"
        : newIng.unit === "ml" || newIng.unit === "l"
        ? "ml"
        : "unidad";

    const gross = window.prompt(
      `Cantidad bruta para ${newIng.name} (en ${unitLabel}):`,
      "0"
    );
    if (gross === null) return { ok: false };

    const decrease = window.prompt(
      "Porcentaje de merma (0 si no aplica):",
      "0"
    );
    if (decrease === null) return { ok: false };

    const lineRes = await fetchJson(
      `/api/restaurant/${restaurantId}/dishes/${dishId}/ingredients`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredient_id: newIng.id,
          gross_weight: Number(gross) || 0,
          decrease_pct: Number(decrease) || 0,
          unit_price_snapshot: newIng.price_per_unit ?? "",
        }),
      }
    );
    if (!lineRes.ok) {
      alert(lineRes.data?.msg || "Error añadiendo ingrediente al plato");
      return { ok: false };
    }

    setShowAddIngModal(false);
    await reloadDish();
    return { ok: true };
  };

  return (
    <>
      <Modal
        show={show}
        onHide={onClose}
        size="lg"
        centered
        style={{ marginTop: "70px" }}
      >
        <Modal.Header
          closeButton
          style={{ borderBottom: "none", paddingBottom: 0 }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                color: "#6b7280",
              }}
            >
              Detalle del plato
            </div>
            <h4 style={{ margin: 0, fontWeight: 700 }}>
              {dish ? dish.name : "Cargando plato..."}
            </h4>
          </div>
        </Modal.Header>

        <Modal.Body style={{ paddingTop: 8 }}>
          {dish && (
            <div
              className="d-flex justify-content-between align-items-center mb-3 p-3 rounded"
              style={{ background: "#f3f4ff" }}
            >
              <div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  Coste total
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  {(dish.cost_price ?? 0).toFixed(2)} €
                </div>
              </div>
              {dish.description && (
                <div
                  style={{
                    maxWidth: 320,
                    fontSize: 13,
                    color: "#4b5563",
                    textAlign: "right",
                  }}
                >
                  {dish.description}
                </div>
              )}
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 style={{ fontWeight: 700, marginBottom: 0 }}>Ingredientes</h6>
            <div className="d-flex gap-2">
              <select
                className="form-control form-control-sm"
                style={{ width: 240 }}
                value=""
                onChange={async (e) => {
                  const ingredientId = Number(e.target.value) || null;
                  if (!ingredientId || !restaurantId || !dishId) return;

                  const ing = existingIngredients.find(
                    (i) => i.id === ingredientId
                  );
                  const name = ing?.name || "";

                  const unitLabel =
                    ing?.unit === "g" || ing?.unit === "kg"
                      ? "gramos"
                      : ing?.unit === "ml" || ing?.unit === "l"
                      ? "ml"
                      : "unidad";

                  const gross = window.prompt(
                    `Cantidad bruta para ${name} (en ${unitLabel}):`,
                    "0"
                  );
                  if (gross === null) return;

                  const decrease = window.prompt(
                    "Porcentaje de merma (0 si no aplica):",
                    "0"
                  );
                  if (decrease === null) return;

                  await fetchJson(
                    `/api/restaurant/${restaurantId}/dishes/${dishId}/ingredients`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        ingredient_id: ingredientId,
                        gross_weight: Number(gross) || 0,
                        decrease_pct: Number(decrease) || 0,
                        unit_price_snapshot: ing?.price_per_unit ?? "",
                      }),
                    }
                  );
                  await reloadDish();
                }}
              >
                <option value="">+ Añadir existente…</option>
                {existingIngredients.map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name} — {ing.price_per_unit} / {ing.unit}
                  </option>
                ))}
              </select>

              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => setShowAddIngModal(true)}
              >
                + Añadir ingrediente
              </button>
            </div>
          </div>

          {lines.length === 0 && (
            <div className="text-muted small">
              Este plato aún no tiene ingredientes.
            </div>
          )}

          {lines.length > 0 && (
            <div
              className="mt-2"
              style={{
                maxHeight: 260,
                overflowY: "auto",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
              }}
            >
              {lines.map((ln) => {
                const ing = existingIngredients.find(
                  (i) => i.id === ln.ingredient_id
                );
                const unitPrice =
                  Number(ln.unit_price_snapshot) ||
                  Number(ing?.price_per_unit) ||
                  0;

                return (
                  <div
                    key={ln.id}
                    className="d-flex justify-content-between align-items-center px-3 py-2"
                    style={{ borderBottom: "1px solid #f3f4f6" }}
                  >
                    <div style={{ maxWidth: "60%" }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>
                        {ln.ingredient_name}
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        {ln.gross_weight} {ln.unit}
                        {ln.decrease_pct
                          ? ` · merma ${ln.decrease_pct}%`
                          : ""}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, color: "#6b7280" }}>
                        Precio usado
                      </div>
                      <div style={{ fontWeight: 600 }}>
                        {unitPrice.toFixed(2)} € /{" "}
                        {ln.unit || ing?.unit || "ud"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Modal.Body>

        <Modal.Footer style={{ borderTop: "none" }}>
          <Button variant="outline-secondary" onClick={onClose}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      <CreateIngredientModal
        show={showAddIngModal}
        onClose={() => setShowAddIngModal(false)}
        onSave={handleSaveIngredientLine}
      />
    </>
  );
}

export default function DishPage({
  dishes,
  restaurantId,
  onDeleteDish,
  existingIngredients = [],
  setExistingIngredients,
}) {
  const [selectedDish, setSelectedDish] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const handleSelectDish = (dish) => {
    setSelectedDish(dish);
    setShowViewModal(true);
  };

  if (!dishes || dishes.length === 0) {
    return <div className="text-muted">No hay platos.</div>;
  }

  return (
    <>
      <div className="d-flex flex-column gap-2">
        {dishes.map((d) => (
          <div
            key={d.id || d._id}
            className="d-flex justify-content-between align-items-center p-2"
            style={{ background: "#fff", borderRadius: 8 }}
          >
            <div
              style={{ cursor: "pointer" }}
              onClick={() => handleSelectDish(d)}
            >
              <div style={{ fontWeight: 600 }}>{d.name}</div>
              <div style={{ fontSize: 12, color: "#666" }}>
                {d.description || ""}
              </div>
            </div>
        
          </div>
        ))}
      </div>

      <ViewDishModal
        show={showViewModal}
        onClose={() => setShowViewModal(false)}
        restaurantId={restaurantId}
        dishId={selectedDish?.id}
        existingIngredients={existingIngredients}
        onUpdateExistingIngredients={setExistingIngredients}
      />
    </>
  );
}
