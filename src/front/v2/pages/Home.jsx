import React, { useEffect } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { api } from "../services/api";
import MasterCard from "../components/MasterCard";
import "./home.css";

export default function HomeV2() {
  const { store, dispatch } = useGlobalReducer();

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id"); // si no existe, lo metemos luego (o lo sacamos del JWT en login)

  // Restaurantes del usuario
  useEffect(() => {
    if (!userId || !token) return;

    (async () => {
      try {
        dispatch({ type: "set_loading", payload: { restaurants: true } });
        dispatch({ type: "set_error", payload: { restaurants: null } });

        const data = await api.getRestaurants(userId);
        const restaurants = data?.restaurants || [];
        dispatch({ type: "set_restaurants", payload: restaurants });

        // MVP UX: si solo hay 1 restaurante y aún no hay seleccionado -> lo seleccionamos y vamos a dashboard
        if (!store.currentRestaurant && restaurants.length === 1) {
          dispatch({ type: "set_currentRestaurant", payload: restaurants[0] });
          dispatch({ type: "set_currentView", payload: "dashboard" });
        }
      } catch (e) {
        dispatch({ type: "set_error", payload: { restaurants: e.message || "Error cargando restaurantes" } });
      } finally {
        dispatch({ type: "set_loading", payload: { restaurants: false } });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, token, dispatch]);

  // Datos del restaurante actual
  useEffect(() => {
    const rid = store.currentRestaurant?.id;
    if (!rid || !token) return;

    (async () => {
      try {
        dispatch({ type: "set_loading", payload: { dishes: true, ingredients: true, categories: true } });

        const [dishes, ingredients, categories] = await Promise.all([
          api.getDishes(rid),
          api.getIngredients(rid),
          api.getCategories(rid),
        ]);

        dispatch({ type: "set_dishes", payload: dishes?.dishes || [] });
        dispatch({ type: "merge_currentRestaurant", payload: { ingredients: ingredients?.ingredients || [] } });
        dispatch({ type: "merge_currentRestaurant", payload: { categories: categories?.categories || [] } });
      } catch (e) {
        dispatch({
          type: "set_error",
          payload: {
            dishes: e.message || "Error cargando datos",
            ingredients: e.message || "Error cargando datos",
            categories: e.message || "Error cargando datos",
          },
        });
      } finally {
        dispatch({ type: "set_loading", payload: { dishes: false, ingredients: false, categories: false } });
      }
    })();
  }, [store.currentRestaurant?.id, token, dispatch]);

  return (
    <div className="v2-app-shell">
      <MasterCard store={store} dispatch={dispatch} />
    </div>
  );
}
