import React, { useEffect, useState } from "react";
import { CreateIngredientModal as InlineIngredientModal } from "./Modals"; 
const backdropStyle = {
  position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
  background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000,
};
const modalStyle = {
  background: "#F0E5CF", padding: 20, borderRadius: 8, width: 820, maxWidth: "95%", maxHeight: "90%", overflow: "auto"
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
  const [imageUrl, setImageUrl] = useState("");
  const [costPrice, setCostPrice] = useState("");

  const [ingredientLines, setIngredientLines] = useState([]);
  const [showInlineIngredientModal, setShowInlineIngredientModal] = useState(false);

  useEffect(() => {
    if (!show) {
      setName("");
      setCategoryId(categories?.[0]?.id || "");
      setDescription("");
      setImageUrl("");
      setCostPrice("");
      setIngredientLines([]);
    }
  }, [show, categories]);

  if (!show) return null;
  if (!restaurant) return (
    <div style={backdropStyle}>
      <div style={modalStyle}>
        <h4>No hay restaurante seleccionado</h4>
        <div className="d-flex justify-content-end">
          <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
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
    setIngredientLines((s) => [
      ...s,
      {
        tmpId: Date.now() + Math.random(),
        isNew: true,
        name: "",
        unit: "",
        price_per_unit: "",
        image_url: "",
        gross_weight: "",
        decrease_pct: 0,
        unit_price_snapshot: "",
      },
    ]);
  };

  const removeLine = (tmpId) => setIngredientLines((s) => s.filter((l) => l.tmpId !== tmpId));
  const updateLine = (tmpId, patch) => setIngredientLines((s) => s.map((l) => (l.tmpId === tmpId ? { ...l, ...patch } : l)));

  const handleSubmit = async () => {
    if (!name.trim()) return alert("El nombre del plato es obligatorio");
    if (!categoryId) return alert("Selecciona una categoría");

    const dishPayload = {
      name: name.trim(),
      category_id: categoryId,
      description: description || null,
      image_url: imageUrl || null,
      cost_price: costPrice !== "" ? Number(costPrice) : null,
    };

    const payload = {
      dishPayload,
      ingredientLines
    };

    const res = await onSave(payload);
    if (res?.ok) onClose();
    else alert(res?.msg || "Error creando plato");
  };

  return (
    <div style={backdropStyle}>
      <div style={modalStyle}>
        <h3>Crear Plato</h3>

        <input className="form-control my-2" placeholder="Nombre del plato" value={name} onChange={(e) => setName(e.target.value)} />

        <div className="d-flex gap-2 mb-2">
          <select className="form-control" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Selecciona categoría</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <input className="form-control" placeholder="Precio costo (opcional)" type="number" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} />
        </div>

        <input className="form-control mb-2" placeholder="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input className="form-control mb-2" placeholder="URL imagen (opcional)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />

        <hr />

        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5>Ingredientes del plato</h5>
          <div>
            <button className="btn btn-outline-primary me-2" onClick={addExistingLine}>+ usar existente</button>
            <button className="btn btn-outline-success" onClick={addNewIngredientLine}>+ crear nuevo inline</button>
          </div>
        </div>

        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
          {ingredientLines.map((line) => (
            <div key={line.tmpId} className="p-2 mb-2" style={{ border: "1px solid #ddd", borderRadius: 6, background: "#fff" }}>
              <div className="d-flex justify-content-between">
                <strong>{line.isNew ? "Nuevo ingrediente" : "Ingrediente existente"}</strong>
                <button className="btn btn-sm btn-danger" onClick={() => removeLine(line.tmpId)}>Eliminar</button>
              </div>

              <div className="mt-2">
                {line.isNew ? (
                  <>
                    <input className="form-control mb-1" placeholder="Nombre del ingrediente" value={line.name} onChange={(e) => updateLine(line.tmpId, { name: e.target.value })} />
                    <div className="d-flex gap-2 mb-1">
                      <input className="form-control" placeholder="Precio por unidad" type="number" value={line.price_per_unit} onChange={(e) => updateLine(line.tmpId, { price_per_unit: e.target.value })} />
                      <select className="form-control" value={line.unit} onChange={(e) => updateLine(line.tmpId, { unit: e.target.value })}>
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
                  <>
                    <select className="form-control mb-1" value={line.ingredient_id || ""} onChange={(e) => updateLine(line.tmpId, { ingredient_id: Number(e.target.value) })}>
                      <option value="">Selecciona ingrediente</option>
                      {existingIngredients.map((ing) => <option key={ing.id} value={ing.id}>{ing.name} — {ing.price_per_unit} / {ing.unit}</option>)}
                    </select>
                  </>
                )}

                <div className="d-flex gap-2 mt-2">
                  <input className="form-control" placeholder="Gross weight" type="number" value={line.gross_weight} onChange={(e) => updateLine(line.tmpId, { gross_weight: e.target.value })} />
                  <input className="form-control" placeholder="% pérdida" type="number" value={line.decrease_pct} onChange={(e) => updateLine(line.tmpId, { decrease_pct: e.target.value })} />
                  <input className="form-control" placeholder="Precio snapshot (opcional)" type="number" value={line.unit_price_snapshot} onChange={(e) => updateLine(line.tmpId, { unit_price_snapshot: e.target.value })} />
                </div>
              </div>
            </div>
          ))}
          {ingredientLines.length === 0 && <div className="text-muted">No has añadido ingredientes aún</div>}
        </div>

        <div className="d-flex justify-content-end gap-2 mt-3">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Crear plato</button>
        </div>
      </div>
    </div>
  );
}
