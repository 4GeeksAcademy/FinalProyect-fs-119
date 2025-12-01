// CreateDishModal.jsx
import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import CreateIngredientModal from "./CreateIngredientModal";

const sectionTitle = {
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#6b7280",
  marginBottom: 4,
};

export default function CreateDishModal({
  show,
  onClose,
  onSave,
  restaurant,
  categories = [],
  existingIngredients = [],
}) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(categories?.[0]?.id || "");
  const [description, setDescription] = useState("");
  const [ingredientLines, setIngredientLines] = useState([]);
  const [showInlineIngredientModal, setShowInlineIngredientModal] =
    useState(false);

  useEffect(() => {
    if (!show) {
      setName("");
      setCategoryId(categories?.[0]?.id || "");
      setDescription("");
      setIngredientLines([]);
    }
  }, [show, categories]);

  if (!show) return null;

  if (!restaurant)
    return (
      <Modal show={show} onHide={onClose} centered>
        <Modal.Header closeButton>
          <div>
            <div style={sectionTitle}>Crear plato</div>
            <h3 style={{ margin: 0, fontWeight: 700 }}>
              No hay restaurante seleccionado
            </h3>
          </div>
        </Modal.Header>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    );

  const addExistingLine = () => {
    setIngredientLines((s) => [
      ...s,
      {
        tmpId: Date.now() + Math.random(),
        isNew: false,
        ingredient_id: existingIngredients?.[0]?.id || null,
        gross_weight: "",
        decrease_pct: 0,
        unit_price_snapshot: "",
      },
    ]);
  };

  const addNewIngredientLine = () => {
    setShowInlineIngredientModal(true);
  };

  const handleInlineIngredientSave = (ingredient) => {
    const newLine = {
      tmpId: Date.now() + Math.random(),
      isNew: true,
      name: ingredient.name || "",
      unit: ingredient.unit || "",
      price_per_unit: ingredient.price_per_unit ?? "",
      image_url: ingredient.image_url || "",
      gross_weight: "",
      decrease_pct: 0,
      unit_price_snapshot: "",
    };
    setIngredientLines((s) => [...s, newLine]);
    setShowInlineIngredientModal(false);
  };

  const removeLine = (tmpId) =>
    setIngredientLines((s) => s.filter((l) => l.tmpId !== tmpId));

  const updateLine = (tmpId, patch) =>
    setIngredientLines((s) =>
      s.map((l) => (l.tmpId === tmpId ? { ...l, ...patch } : l))
    );

  const handleSubmit = async () => {
    if (!name.trim()) return alert("El nombre del plato es obligatorio");
    if (!categoryId) return alert("Selecciona una categoría");

    const dishPayload = {
      name: name.trim(),
      category_id: categoryId,
      description: description || null,
    };

    const payload = {
      dishPayload,
      ingredientLines,
    };

    const res = await onSave(payload);
    if (res?.ok) onClose();
    else alert(res?.msg || "Error creando plato");
  };

  return (
    <>
      <Modal show={show} onHide={onClose} size="lg" centered>
        <Modal.Header closeButton>
          <div>
            <div style={sectionTitle}>Crear plato</div>
            <h3 style={{ margin: 0, fontWeight: 700 }}>Nuevo plato</h3>
            <div style={{ fontSize: 13, color: "#6b7280" }}>
              En {restaurant.name}
            </div>
          </div>
        </Modal.Header>

        <Modal.Body>
          <div className="mb-3">
            <label className="form-label" style={{ fontWeight: 600 }}>
              Nombre del plato
            </label>
            <input
              className="form-control"
              placeholder="Ej. Macarrones a la boloñesa"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="d-flex gap-2 mb-3">
            <div className="flex-grow-1">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Categoría
              </label>
              <select
                className="form-control"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Selecciona categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label" style={{ fontWeight: 600 }}>
              Descripción
            </label>
            <input
              className="form-control"
              placeholder="Opcional"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <hr />

          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 style={{ margin: 0 }}>Ingredientes del plato</h5>
            <div>
              <button
                className="btn btn-sm btn-outline-primary me-2"
                onClick={addExistingLine}
              >
                + Usar existente
              </button>
              <button
                className="btn btn-sm btn-outline-success"
                onClick={addNewIngredientLine}
              >
                + Crear nuevo inline
              </button>
            </div>
          </div>

          <div
            style={{
              maxHeight: 300,
              overflowY: "auto",
              paddingRight: 4,
              marginBottom: 12,
            }}
          >
            {ingredientLines.map((line) => (
              <div
                key={line.tmpId}
                className="p-2 mb-2"
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  background: "#ffffff",
                }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <strong>
                    {line.isNew ? "Nuevo ingrediente" : "Ingrediente existente"}
                  </strong>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeLine(line.tmpId)}
                  >
                    Eliminar
                  </button>
                </div>

                <div className="mt-2">
                  {line.isNew ? (
                    <>
                      <input
                        className="form-control mb-1"
                        placeholder="Nombre del ingrediente"
                        value={line.name}
                        onChange={(e) =>
                          updateLine(line.tmpId, { name: e.target.value })
                        }
                      />
                      <div className="d-flex gap-2 mb-1">
                        <input
                          className="form-control"
                          placeholder="Precio por unidad"
                          type="number"
                          value={line.price_per_unit}
                          onChange={(e) =>
                            updateLine(line.tmpId, {
                              price_per_unit: e.target.value,
                            })
                          }
                        />
                        <select
                          className="form-control"
                          value={line.unit}
                          onChange={(e) =>
                            updateLine(line.tmpId, { unit: e.target.value })
                          }
                        >
                          <option value="">Unidad</option>
                          <option value="g">g</option>
                          <option value="kg">kg</option>
                          <option value="ml">ml</option>
                          <option value="l">l</option>
                          <option value="ud">ud</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <select
                      className="form-control mb-1"
                      value={line.ingredient_id || ""}
                      onChange={(e) =>
                        updateLine(line.tmpId, {
                          ingredient_id: Number(e.target.value),
                        })
                      }
                    >
                      <option value="">Selecciona ingrediente</option>
                      {existingIngredients.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name} — {ing.price_per_unit} / {ing.unit}
                        </option>
                      ))}
                    </select>
                  )}

                  <div className="d-flex gap-2 mt-2">
                    <input
                      className="form-control"
                      placeholder="Gross weight"
                      type="number"
                      value={line.gross_weight}
                      onChange={(e) =>
                        updateLine(line.tmpId, {
                          gross_weight: e.target.value,
                        })
                      }
                    />
                    <input
                      className="form-control"
                      placeholder="% pérdida"
                      type="number"
                      value={line.decrease_pct}
                      onChange={(e) =>
                        updateLine(line.tmpId, {
                          decrease_pct: e.target.value,
                        })
                      }
                    />
                    <input
                      className="form-control"
                      placeholder="Precio snapshot (opcional)"
                      type="number"
                      value={line.unit_price_snapshot}
                      onChange={(e) =>
                        updateLine(line.tmpId, {
                          unit_price_snapshot: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
            {ingredientLines.length === 0 && (
              <div className="text-muted">No has añadido ingredientes aún</div>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Crear plato
          </Button>
        </Modal.Footer>
      </Modal>

      <CreateIngredientModal
        show={showInlineIngredientModal}
        onClose={() => setShowInlineIngredientModal(false)}
        onSave={handleInlineIngredientSave}
      />
    </>
  );
}
