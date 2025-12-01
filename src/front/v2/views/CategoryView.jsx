// src/front/v2/views/CategoryView.jsx
import React, { useState } from "react";
import { api } from "../services/api";
import CategoryList from "../../pages/CategoryList";

export default function CategoryView({
  currentRestaurant,
  categories,
  store,
  dispatch,
}) {
  const [mode, setMode] = useState("list"); // list | create
  const [catName, setCatName] = useState("");
  const [catImage, setCatImage] = useState("");

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
      setMode("list");
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

  return (
    <section className="mc-panel">
      {mode === "list" && (
        <>
          <div className="mc-panel-head">
            <h3>Categories</h3>
            <button className="mc-cta" onClick={() => setMode("create")}>
              New Category
            </button>
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

      {mode === "create" && (
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
