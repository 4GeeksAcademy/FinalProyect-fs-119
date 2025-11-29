import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import CategoryList from "./CategoryList";
import RestaurantList from "./RestaurantList";
import IngredientList from "./IngredientList";
import DishList from "../components/DishList";
import CreateDishModal from "../components/CreateDishModal";
import {
  CreateCategoryModal,
  CreateRestaurantModal,
  CreateIngredientModal,
} from "../components/Modals";
import useGlobalReducer from "../hooks/useGlobalReducer";

const API = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

const Home = () => {
  const { store, dispatch } = useGlobalReducer();
  const user_id = localStorage.getItem("user_id");
  const currentRestaurant = store.currentRestaurant;
  const currentView = store.currentView || "restaurants";

  useEffect(() => {
    if (!user_id) return;
    const load = async () => {
      dispatch({ type: "set_loading", payload: { restaurants: true } });
      try {
        const res = await fetch(`${API}/api/user/${user_id}/restaurant`);
        const data = await res.json();
        if (res.ok) dispatch({ type: "set_restaurants", payload: data.restaurants || [] });
        else dispatch({ type: "set_error", payload: { restaurants: data.msg || "Error" } });
      } catch (err) {
        dispatch({ type: "set_error", payload: { restaurants: err.message } });
      } finally {
        dispatch({ type: "set_loading", payload: { restaurants: false } });
      }
    };
    load();
  }, [user_id, dispatch]);

  useEffect(() => {
    if (!currentRestaurant?.id) return;
    loadDishes();
    (async () => {
      try {
        const r = await fetch(`${API}/api/restaurant/${currentRestaurant.id}/categories`);
        const d = await r.json();
        if (r.ok) dispatch({ type: "merge_currentRestaurant", payload: { categories: d.categories || [] } });
      } catch {}
      try {
        const r2 = await fetch(`${API}/api/restaurant/${currentRestaurant.id}/ingredients`);
        const d2 = await r2.json();
        if (r2.ok) dispatch({ type: "merge_currentRestaurant", payload: { ingredients: d2.ingredients || [] } });
      } catch {}
    })();
  }, [currentRestaurant?.id, dispatch]);

  const loadDishes = async () => {
    if (!currentRestaurant?.id) return;
    dispatch({ type: "set_loading", payload: { dishes: true } });
    try {
      const res = await fetch(`${API}/api/restaurant/${currentRestaurant.id}/dishes`);
      const data = await res.json();
      if (res.ok) dispatch({ type: "set_dishes", payload: data.dishes || [] });
      else dispatch({ type: "set_error", payload: { dishes: data.msg || "Error cargando platos" } });
    } catch (err) {
      dispatch({ type: "set_error", payload: { dishes: err.message } });
    } finally {
      dispatch({ type: "set_loading", payload: { dishes: false } });
    }
  };

  const createDishWithLines = async ({ dishPayload, ingredientLines = [] }) => {
    if (!currentRestaurant?.id) return { ok: false, msg: "No restaurant" };
    dispatch({ type: "set_loading", payload: { dishes: true } });
    try {
      const createdMap = {};
      for (const line of ingredientLines) {
        if (line.isNew) {
          const body = {
            name: line.name,
            unit: line.unit,
            price_per_unit: Number(line.price_per_unit || 0),
            image_url: line.image_url || null,
            id_product_api: line.id_product_api || null,
          };
          const r = await fetch(`${API}/api/restaurant/${currentRestaurant.id}/ingredients`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const d = await r.json();
          if (!r.ok) throw new Error(d.msg || "Error creando ingrediente");
          createdMap[line.tmpId] = d.ingrediente?.id || d.ingredient?.id || null;
        }
      }

      const resDish = await fetch(`${API}/api/restaurant/${currentRestaurant.id}/dishes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dishPayload),
      });
      const dataDish = await resDish.json();
      if (!resDish.ok) throw new Error(dataDish.msg || "Error creando plato");
      const newDish = dataDish.dish;

      for (const line of ingredientLines) {
        const ingredient_id = line.isNew ? createdMap[line.tmpId] : line.ingredient_id;
        if (!ingredient_id) continue;
        const bodyLine = {
          ingredient_id,
          gross_weight: Number(line.gross_weight || 0),
          decrease_pct: Number(line.decrease_pct || 0),
          unit_price_snapshot:
            line.unit_price_snapshot === "" ? null : line.unit_price_snapshot == null ? null : Number(line.unit_price_snapshot),
        };
        try {
          const rLine = await fetch(`${API}/api/restaurant/${currentRestaurant.id}/dishes/${newDish.id}/ingredients`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyLine),
          });
          if (!rLine.ok) {
            const txt = await rLine.text();
            console.warn("No se pudo crear dish line:", rLine.status, txt);
          }
        } catch (e) {
          console.warn("Error creando línea:", e);
        }
      }

      await loadDishes();

      try {
        const ings = await fetch(`${API}/api/restaurant/${currentRestaurant.id}/ingredients`);
        const ingsData = await ings.json();
        if (ings.ok) dispatch({ type: "merge_currentRestaurant", payload: { ingredients: ingsData.ingredients || [] } });
      } catch {}

      dispatch({ type: "add_dish", payload: newDish });
      dispatch({ type: "set_error", payload: { dishes: null } });
      return { ok: true, dish: newDish };
    } catch (err) {
      dispatch({ type: "set_error", payload: { dishes: err.message } });
      return { ok: false, msg: err.message };
    } finally {
      dispatch({ type: "set_loading", payload: { dishes: false } });
    }
  };

  const deleteDish = async (dishId) => {
    if (!currentRestaurant?.id || !dishId) return { ok: false, msg: "Ids missing" };
    dispatch({ type: "set_loading", payload: { dishes: true } });
    try {
      const res = await fetch(`${API}/api/restaurant/${currentRestaurant.id}/dishes/${dishId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Error eliminando plato");
      dispatch({ type: "remove_dish", payload: dishId });
      await loadDishes();
      return { ok: true };
    } catch (err) {
      dispatch({ type: "set_error", payload: { dishes: err.message } });
      return { ok: false, msg: err.message };
    } finally {
      dispatch({ type: "set_loading", payload: { dishes: false } });
    }
  };

  const selectRestaurant = (restaurant) => {
    dispatch({ type: "set_currentRestaurant", payload: restaurant });
    dispatch({ type: "set_currentView", payload: "categories" });
  };

  const openRestaurantModal = () => dispatch({ type: "ui_set", payload: { showRestaurantModal: true } });
  const openCategoryModal = () => dispatch({ type: "ui_set", payload: { showCategoryModal: true } });
  const openIngredientModal = () => dispatch({ type: "ui_set", payload: { showIngredientModal: true } });
  const openDishModal = () => dispatch({ type: "ui_set", payload: { showDishModal: true } });

  const closeRestaurantModal = () => dispatch({ type: "ui_set", payload: { showRestaurantModal: false } });
  const closeCategoryModal = () => dispatch({ type: "ui_set", payload: { showCategoryModal: false } });
  const closeIngredientModal = () => dispatch({ type: "ui_set", payload: { showIngredientModal: false } });
  const closeDishModal = () => dispatch({ type: "ui_set", payload: { showDishModal: false } });

  const saveRestaurant = async ({ name, telefono, direccion }) => {
    if (!user_id) return;
    try {
      const res = await fetch(`${API}/api/user/${user_id}/restaurant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, telefono, direccion }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Error");
      const newRestaurant = { ...data.restaurante, categories: [], ingredients: [] };
      dispatch({ type: "add_restaurant", payload: newRestaurant });
      dispatch({ type: "set_currentRestaurant", payload: newRestaurant });
      dispatch({ type: "set_currentView", payload: "categories" });
      closeRestaurantModal();
    } catch (err) {
      dispatch({ type: "set_error", payload: { restaurants: err.message } });
    }
  };

  const deleteRestaurant = async (restaurantId) => {
    if (!user_id) return;
    try {
      const res = await fetch(`${API}/api/user/${user_id}/restaurant/${restaurantId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Error");
      dispatch({ type: "remove_restaurant", payload: restaurantId });
      if (currentRestaurant?.id === restaurantId) {
        dispatch({ type: "set_currentRestaurant", payload: null });
        dispatch({ type: "set_currentView", payload: "restaurants" });
      }
    } catch (err) {
      dispatch({ type: "set_error", payload: { restaurants: err.message } });
    }
  };

  const saveCategory = async (name) => {
    if (!currentRestaurant?.id) return;
    try {
      const res = await fetch(`${API}/api/restaurant/${currentRestaurant.id}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Error");
      const listRes = await fetch(`${API}/api/restaurant/${currentRestaurant.id}/categories`);
      const list = await listRes.json();
      dispatch({ type: "merge_currentRestaurant", payload: { categories: list.categories || [] } });
      dispatch({
        type: "set_restaurants",
        payload: (store.restaurants || []).map((r) => (r.id === currentRestaurant.id ? { ...r, categories: list.categories || [] } : r)),
      });
      closeCategoryModal();
    } catch (err) {
      dispatch({ type: "set_error", payload: { categories: err.message } });
    }
  };

  const saveIngredient = async (ingredientData) => {
    if (!currentRestaurant?.id) return;
    try {
      const res = await fetch(`${API}/api/restaurant/${currentRestaurant.id}/ingredients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ingredientData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Error");
      const ingsRes = await fetch(`${API}/api/restaurant/${currentRestaurant.id}/ingredients`);
      const ings = await ingsRes.json();
      if (ingsRes.ok) dispatch({ type: "merge_currentRestaurant", payload: { ingredients: ings.ingredients || [] } });
      closeIngredientModal();
    } catch (err) {
      dispatch({ type: "set_error", payload: { ingredients: err.message } });
    }
  };

  const handleCreateDish = async ({ dishPayload, ingredientLines }) => {
    const result = await createDishWithLines({ dishPayload, ingredientLines });
    if (result.ok) {
      await loadDishes();
      closeDishModal();
    } else {
      dispatch({ type: "set_error", payload: { dishes: result.msg } });
    }
  };

  const handleDeleteDish = async (dishId) => {
    const res = await deleteDish(dishId);
    if (!res.ok) dispatch({ type: "set_error", payload: { dishes: res.msg } });
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#F0E5CF" }}>
      <Sidebar onOpenRestaurantModal={openRestaurantModal} onChangeView={(view) => dispatch({ type: "set_currentView", payload: view })} />

      <div className="flex-grow-1 p-4">
        <h3 style={{ color: "#4B6587" }}>Restaurantes</h3>

        <RestaurantList restaurants={store.restaurants || []} onSelect={selectRestaurant} onDelete={deleteRestaurant} />

        {currentView === "categories" && currentRestaurant && (
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3 style={{ color: "#4B6587" }}>Categorías de {currentRestaurant.name}</h3>
              <button className="btn btn-primary rounded-circle" onClick={openCategoryModal}>+</button>
            </div>
            <CategoryList categories={currentRestaurant.categories || []} onDelete={async (id) => {
              try {
                const res = await fetch(`${API}/api/restaurant/${currentRestaurant.id}/categories/${id}`, { method: "DELETE" });
                const data = await res.json();
                if (!res.ok) throw new Error(data.msg || "Error");
                const updated = (currentRestaurant.categories || []).filter((c) => c.id !== id);
                dispatch({ type: "merge_currentRestaurant", payload: { categories: updated } });
                dispatch({
                  type: "set_restaurants",
                  payload: (store.restaurants || []).map((r) => (r.id === currentRestaurant.id ? { ...r, categories: updated } : r)),
                });
              } catch (err) {
                dispatch({ type: "set_error", payload: { categories: err.message } });
              }
            }} />
          </div>
        )}

        {currentView === "ingredients" && currentRestaurant && (
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3 style={{ color: "#4B6587" }}>Ingredientes de {currentRestaurant.name}</h3>
              <button className="btn btn-primary rounded-circle" onClick={openIngredientModal}>+</button>
            </div>
            <IngredientList ingredients={currentRestaurant.ingredients || []} onDelete={async (id) => {
              try {
                const res = await fetch(`${API}/api/restaurant/${currentRestaurant.id}/ingredients/${id}`, { method: "DELETE" });
                const data = await res.json();
                if (!res.ok) throw new Error(data.msg || "Error");
                const ingsRes = await fetch(`${API}/api/restaurant/${currentRestaurant.id}/ingredients`);
                const ings = await ingsRes.json();
                if (ingsRes.ok) dispatch({ type: "merge_currentRestaurant", payload: { ingredients: ings.ingredients || [] } });
              } catch (err) {
                dispatch({ type: "set_error", payload: { ingredients: err.message } });
              }
            }} />
          </div>
        )}

        {currentView === "dishes" && currentRestaurant && (
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3 style={{ color: "#4B6587" }}>Platos de {currentRestaurant.name}</h3>
              <button className="btn btn-primary rounded-circle" onClick={openDishModal}>+</button>
            </div>
            <DishList dishes={store.dishes || []} onDelete={handleDeleteDish} onView={() => {}} />
          </div>
        )}
      </div>

      <CreateRestaurantModal show={store.ui.showRestaurantModal} onClose={closeRestaurantModal} onSave={saveRestaurant} />
      <CreateCategoryModal show={store.ui.showCategoryModal} onClose={closeCategoryModal} onSave={saveCategory} />
      <CreateIngredientModal show={store.ui.showIngredientModal} onClose={closeIngredientModal} onSave={saveIngredient} />
      <CreateDishModal
        show={store.ui.showDishModal}
        onClose={closeDishModal}
        onSave={handleCreateDish}
        restaurant={currentRestaurant}
        categories={currentRestaurant?.categories || []}
        existingIngredients={currentRestaurant?.ingredients || []}
      />
    </div>
  );
};

export default Home;
