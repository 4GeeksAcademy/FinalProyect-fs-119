import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import CategoryList from "./CategoryList";
import IngredientList from "./IngredientList";
import CreateDishModal from "../components/CreateDishModal";
import CreateCategoryModal from "../components/CreateCategoryModal";
import CreateRestaurantModal from "../components/CreateRestaurantModal";
import CreateIngredientModal from "../components/CreateIngredientModal";
import useGlobalReducer from "../hooks/useGlobalReducer";
import SummaryCard from "../components/Dashboard/Summarycard";
import TopDishes from "../components/Dashboard/TopDishes";
import IngredientsPanel from "../components/Dashboard/IngredientsPanel";
import DishPage from "./DishPage";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "";

async function fetchJson(path, opts = {}) {
  try {
    const url = new URL(path.replace(/^\//, ""), API_BASE).toString();
    const res = await fetch(url, opts);
    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data, res };
  } catch (err) {
    return { ok: false, status: null, data: null, error: err };
  }
}

const Home = () => {
  const { store, dispatch } = useGlobalReducer();
  const user_id = localStorage.getItem("user_id");
  const currentRestaurant = store.currentRestaurant;
  const view = store.currentView || "dashboard";
  const [selectedDishIngredients, setSelectedDishIngredients] = useState([]);

  useEffect(() => {
    if (!user_id) return;
    (async () => {
      const r = await fetchJson(`api/user/${user_id}/restaurant`);
      const list =
        r?.data?.restaurants || r?.data?.restaurants_serialized || [];
      dispatch({
        type: "set_restaurants",
        payload: Array.isArray(list) ? list : [],
      });
    })();
  }, [user_id, dispatch]);

  useEffect(() => {
    if (!currentRestaurant?.id) return;
    (async () => {
      const rest = currentRestaurant.id;

      const d = await fetchJson(`api/restaurant/${rest}/dishes`);
      if (d.ok && d.data)
        dispatch({
          type: "set_dishes",
          payload: d.data.dishes || d.data || [],
        });

      const c = await fetchJson(`api/restaurant/${rest}/categories`);
      const cats = c?.data?.categories || c?.data?.categoria || c?.data || [];
      if (c.ok && Array.isArray(cats))
        dispatch({
          type: "merge_currentRestaurant",
          payload: { categories: cats },
        });

      const i = await fetchJson(`api/restaurant/${rest}/ingredients`);
      if (i.ok && i.data)
        dispatch({
          type: "merge_currentRestaurant",
          payload: { ingredients: i.data.ingredients || i.data || [] },
        });
    })();
  }, [currentRestaurant?.id, dispatch]);

  const openRestaurantModal = () =>
    dispatch({ type: "ui_set", payload: { showRestaurantModal: true } });
  const openDishModal = () =>
    dispatch({ type: "ui_set", payload: { showDishModal: true } });

  const createRestaurant = async (payload) => {
    if (!user_id) return { ok: false, msg: "No user_id" };
    const r = await fetchJson(`api/user/${user_id}/restaurant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const newR =
      r?.data?.restaurante || r?.data?.restaurant || r?.data || null;
    if (r.ok && newR) {
      dispatch({
        type: "set_restaurants",
        payload: [...(store.restaurants || []), newR],
      });
      dispatch({ type: "set_currentRestaurant", payload: newR });
      dispatch({
        type: "ui_set",
        payload: { showRestaurantModal: false },
      });
      return { ok: true, data: newR };
    }
    return { ok: false, msg: r?.data?.msg || "Error" };
  };

  const createCategory = async (name) => {
    if (!currentRestaurant?.id)
      return { ok: false, msg: "Selecciona un restaurante" };
    const rest = currentRestaurant.id;
    const r = await fetchJson(`api/restaurant/${rest}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const created = r.ok
      ? r?.data?.categoria || r?.data?.category || r?.data
      : { id: `local-${Date.now()}`, name };
    const list = [...(currentRestaurant.categories || []), created];
    dispatch({
      type: "merge_currentRestaurant",
      payload: { categories: list },
    });
    dispatch({
      type: "ui_set",
      payload: { showCategoryModal: false },
    });
    return { ok: true, data: created };
  };

  const createIngredient = async (ingredient) => {
    if (!currentRestaurant?.id)
      return { ok: false, msg: "Selecciona un restaurante" };
    const rest = currentRestaurant.id;
    const r = await fetchJson(`api/restaurant/${rest}/ingredients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ingredient),
    });
    const newIng = r.ok
      ? r?.data?.ingrediente || r?.data?.ingredient || r?.data
      : { ...ingredient, id: `local-${Date.now()}` };
    const list = [...(currentRestaurant.ingredients || []), newIng];
    dispatch({
      type: "merge_currentRestaurant",
      payload: { ingredients: list },
    });
    dispatch({
      type: "ui_set",
      payload: { showIngredientModal: false },
    });
    return { ok: true, data: newIng };
  };

  const createDish = async ({ dishPayload, ingredientLines }) => {
    if (!currentRestaurant?.id)
      return { ok: false, msg: "Selecciona un restaurante" };
    const rest = currentRestaurant.id;

    const r = await fetchJson(`api/restaurant/${rest}/dishes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dishPayload),
    });

    const newDish = r.ok ? r?.data?.dish || r?.data : null;
    if (!r.ok || !newDish?.id) {
      return { ok: false, msg: r?.data?.msg || "Error creando plato" };
    }

    for (const line of ingredientLines) {
      let ingredientId = line.ingredient_id || null;

      if (line.isNew) {
        const ingRes = await fetchJson(`api/restaurant/${rest}/ingredients`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: line.name,
            unit: line.unit,
            price_per_unit: line.price_per_unit,
            image_url: line.image_url || null,
          }),
        });

        const newIng = ingRes.ok
          ? ingRes?.data?.ingrediente ||
            ingRes?.data?.ingredient ||
            ingRes?.data
          : null;

        if (!ingRes.ok || !newIng?.id) {
          console.error("Error creando ingrediente inline", ingRes.data);
          continue;
        }
        ingredientId = newIng.id;
      }

      if (!ingredientId) continue;

      await fetchJson(
        `api/restaurant/${rest}/dishes/${newDish.id}/ingredients`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ingredient_id: ingredientId,
            gross_weight: line.gross_weight || 0,
            decrease_pct: line.decrease_pct || 0,
            unit_price_snapshot: line.unit_price_snapshot || "",
          }),
        }
      );
    }

    dispatch({ type: "add_dish", payload: newDish });
    dispatch({ type: "ui_set", payload: { showDishModal: false } });

    return { ok: true, data: newDish };
  };

  const handleSelectCategory = async (category) => {
    dispatch({ type: "set_selectedCategory", payload: category });
    dispatch({ type: "set_currentView", payload: "dishes" });
    const rest = currentRestaurant?.id;
    if (!rest) return;
    const d = await fetchJson(`api/restaurant/${rest}/dishes`);
    const all = d?.data?.dishes || d?.data || [];
    const filtered = Array.isArray(all)
      ? all.filter(
          (dd) =>
            String(dd.category_id) === String(category.id) ||
            String(dd.category?.id || dd.category) === String(category.id)
        )
      : [];
    dispatch({ type: "set_dishes", payload: filtered });
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar onOpenRestaurantModal={openRestaurantModal} />
      <main className="flex-grow-1 p-4" style={{ background: "#F7F9FB" }}>
        {view === "categories" && currentRestaurant && (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 style={{ margin: 0 }}>
                Categorías de {currentRestaurant.name}
              </h3>
              <button
                className="btn btn-primary"
                onClick={() =>
                  dispatch({
                    type: "ui_set",
                    payload: { showCategoryModal: true },
                  })
                }
              >
                +
              </button>
            </div>
            <CategoryList
              categories={currentRestaurant.categories || []}
              onSelectCategory={handleSelectCategory}
            />
          </>
        )}

        {view === "dishes" && currentRestaurant && (
          <>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3 className="d-flex align-items-center" style={{ gap: 8 }}>
                <span>Platos de {currentRestaurant.name}</span>

                {currentRestaurant.categories?.length > 0 && (
                  <div className="dropdown">
                    <button
                      className="btn btn-sm btn-outline-secondary dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      {store.selectedCategory
                        ? store.selectedCategory.name
                        : "Todas las categorías"}
                    </button>
                    <ul className="dropdown-menu">
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={async () => {
                            dispatch({ type: "set_selectedCategory", payload: null });
                            const rest = currentRestaurant?.id;
                            if (!rest) return;
                            const d = await fetchJson(`api/restaurant/${rest}/dishes`);
                            const all = d?.data?.dishes || d?.data || [];
                            dispatch({ type: "set_dishes", payload: Array.isArray(all) ? all : [] });
                          }}
                        >
                          Todas las categorías
                        </button>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      {currentRestaurant.categories.map((c) => (
                        <li key={c.id}>
                          <button
                            className="dropdown-item"
                            onClick={() => handleSelectCategory(c)}
                          >
                            {c.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </h3>

              <button
                className="btn btn-primary rounded-circle"
                onClick={openDishModal}
              >
                +
              </button>
            </div>
            <DishPage
              dishes={store.dishes || []}
              restaurantId={currentRestaurant.id}
              onDeleteDish={() => {}}
              existingIngredients={currentRestaurant?.ingredients || []}
            />
          </>
        )}

        {view === "ingredients" && currentRestaurant && (
          <>
            <div className="d-flex justify-content-between mb-2">
              <h3>
                Ingredientes
                {selectedDishIngredients.length
                  ? ` — ${selectedDishIngredients.length}`
                  : ` de ${currentRestaurant.name}`}
              </h3>
              <button
                className="btn btn-primary"
                onClick={() =>
                  dispatch({
                    type: "ui_set",
                    payload: { showIngredientModal: true },
                  })
                }
              >
                +
              </button>
            </div>
            <IngredientList
              ingredients={
                selectedDishIngredients.length
                  ? selectedDishIngredients
                  : store.currentRestaurant?.ingredients || []
              }
            />
          </>
        )}

       {view === "dashboard" && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 style={{ color: "#21334a" }}>Resumen</h2>
          </div>

          <div className="d-flex gap-3 mb-4">
            <SummaryCard number={store.dishes?.length || 0} label="Platos" />
            <SummaryCard
              number={store.currentRestaurant?.ingredients?.length || 0}
              label="Ingredientes"
            />
            <SummaryCard
              number={store.currentRestaurant?.categories?.length || 0}
              label="Categorías"
            />
          </div>

          <div className="row">
            <div className="col-lg-7 mb-4">
              <div className="card p-3">
                <h5 className="mb-3">Platos destacados</h5>
                <TopDishes dishes={store.dishes || []} />
              </div>
            </div>
            <div className="col-lg-5 mb-4">
              <div className="card p-3">
                <h5 className="mb-3">Ingredientes</h5>
                <IngredientsPanel
                  ingredients={store.currentRestaurant?.ingredients || []}
                />
              </div>
            </div>
          </div>
        </>
      )}

      </main>

      <CreateRestaurantModal
        show={store.ui.showRestaurantModal}
        onClose={() =>
          dispatch({
            type: "ui_set",
            payload: { showRestaurantModal: false },
          })
        }
        onSave={createRestaurant}
      />
      <CreateCategoryModal
        show={store.ui.showCategoryModal}
        onClose={() =>
          dispatch({ type: "ui_set", payload: { showCategoryModal: false } })
        }
        onSave={createCategory}
      />
      <CreateIngredientModal
        show={store.ui.showIngredientModal}
        onClose={() =>
          dispatch({ type: "ui_set", payload: { showIngredientModal: false } })
        }
        onSave={createIngredient}
      />
      <CreateDishModal
        show={store.ui.showDishModal}
        onClose={() =>
          dispatch({ type: "ui_set", payload: { showDishModal: false } })
        }
        onSave={createDish}
        restaurant={currentRestaurant}
        categories={currentRestaurant?.categories || []}
        existingIngredients={currentRestaurant?.ingredients || []}
      />
    </div>
  );
};

export default Home;