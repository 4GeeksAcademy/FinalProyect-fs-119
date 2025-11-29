import React, { useEffect } from "react";
import Sidebar from "/workspaces/FinalProyect-fs-119/src/front/pages/Sidebar.jsx";
import CategoryList from "./CategoryList";
import RestaurantList from "./RestaurantList";
import IngredientList from "./IngredientList";
import DishList from "../components/DishList";
import CreateDishModal from "../components/CreateDishModal";
import { CreateCategoryModal, CreateRestaurantModal, CreateIngredientModal } from "../components/Modals";
import useGlobalReducer from "../hooks/useGlobalReducer";
import SummaryCard from "/workspaces/FinalProyect-fs-119/src/front/components/Dashboard/Summarycard.jsx";
import TopDishes from "/workspaces/FinalProyect-fs-119/src/front/components/Dashboard/TopDishes.jsx";
import IngredientAlerts from "/workspaces/FinalProyect-fs-119/src/front/components/Dashboard/IngredientsAlerts.jsx";

const API = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

const Home = () => {
  const { store, dispatch } = useGlobalReducer();
  const user_id = localStorage.getItem("user_id");
  const currentRestaurant = store.currentRestaurant;
  const view = store.currentView || "dashboard";

  useEffect(() => {
    if (!user_id) return;
    (async () => {
      try {
        const res = await fetch(`${API}/api/user/${user_id}/restaurant`);
        const data = await res.json();
        if (res.ok) dispatch({ type: "set_restaurants", payload: data.restaurants || [] });
      } catch (e) {
        console.error(e);
      }
    })();
  }, [user_id, dispatch]);

  useEffect(() => {
    if (!currentRestaurant?.id) return;
    (async () => {
      try {
        const r1 = await fetch(`${API}/api/restaurant/${currentRestaurant.id}/dishes`);
        const d1 = await r1.json();
        if (r1.ok) dispatch({ type: "set_dishes", payload: d1.dishes || [] });

        const r2 = await fetch(`${API}/api/restaurant/${currentRestaurant.id}/ingredients`);
        const d2 = await r2.json();
        if (r2.ok) dispatch({ type: "merge_currentRestaurant", payload: { ingredients: d2.ingredients || [] } });

        const r3 = await fetch(`${API}/api/restaurant/${currentRestaurant.id}/categories`);
        const d3 = await r3.json();
        if (r3.ok) dispatch({ type: "merge_currentRestaurant", payload: { categories: d3.categories || [] } });
      } catch (e) {
        console.error(e);
      }
    })();
  }, [currentRestaurant?.id, dispatch]);

  const openRestaurantModal = () => dispatch({ type: "ui_set", payload: { showRestaurantModal: true } });
  const openDishModal = () => dispatch({ type: "ui_set", payload: { showDishModal: true } });

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar onOpenRestaurantModal={openRestaurantModal} />

      <main className="flex-grow-1 p-4" style={{ background: "#F7F9FB" }}>
        {view === "dashboard" && (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 style={{ color: "#21334a" }}>Summary</h2>
              <div>
                <button className="btn btn-sm" onClick={openDishModal} style={{ background: "#4B6587", color: "#fff" }}>Crear Plato</button>
              </div>
            </div>

            <div className="d-flex gap-3 mb-4">
              <SummaryCard number={store.dishes?.length || 0} label="Dishes" />
              <SummaryCard number={store.currentRestaurant?.ingredients?.length || 0} label="Ingredients" />
              <SummaryCard number={55} label="Avg. Margin" suffix="%" />
            </div>

            <div className="row">
              <div className="col-lg-7 mb-4">
                <div className="card p-3">
                  <h5 className="mb-3">Top Dishes by Margin</h5>
                  <TopDishes dishes={store.dishes || []} />
                </div>
              </div>

              <div className="col-lg-5 mb-4">
                <div className="card p-3">
                  <h5 className="mb-3">Ingredient Alerts</h5>
                  <IngredientAlerts ingredients={store.currentRestaurant?.ingredients || []} />
                </div>
              </div>
            </div>
          </>
        )}

        {view === "categories" && currentRestaurant && (
          <>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3>Categorías de {currentRestaurant.name}</h3>
              {/* botón crear categoría */}
            </div>
            <CategoryList categories={currentRestaurant.categories || []} />
          </>
        )}

        {view === "ingredients" && currentRestaurant && (
          <>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3>Ingredientes de {currentRestaurant.name}</h3>
              {/* botón crear ingrediente */}
            </div>
            <IngredientList ingredients={currentRestaurant.ingredients || []} />
          </>
        )}

        {view === "dishes" && currentRestaurant && (
          <>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3>Platos de {currentRestaurant.name}</h3>
              <button className="btn btn-primary rounded-circle" onClick={openDishModal}>+</button>
            </div>
            <DishList dishes={store.dishes || []} onDelete={() => {}} />
          </>
        )}
      </main>

      <CreateRestaurantModal show={store.ui.showRestaurantModal} onClose={() => dispatch({ type: "ui_set", payload: { showRestaurantModal: false } })} onSave={() => {}} />
      <CreateCategoryModal show={store.ui.showCategoryModal} onClose={() => dispatch({ type: "ui_set", payload: { showCategoryModal: false } })} onSave={() => {}} />
      <CreateIngredientModal show={store.ui.showIngredientModal} onClose={() => dispatch({ type: "ui_set", payload: { showIngredientModal: false } })} onSave={() => {}} />
      <CreateDishModal show={store.ui.showDishModal} onClose={() => dispatch({ type: "ui_set", payload: { showDishModal: false } })} onSave={() => {}} restaurant={currentRestaurant} categories={currentRestaurant?.categories || []} existingIngredients={currentRestaurant?.ingredients || []} />
    </div>
  );
};

export default Home;
