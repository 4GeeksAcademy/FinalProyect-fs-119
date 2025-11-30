// src/front/v2/pages/Home.jsx
import React, { useEffect } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { api } from "../services/api";
import MasterCard from "../components/MasterCard";
import "./home.css";

export default function HomeV2() {
  const { store, dispatch } = useGlobalReducer();
  const userId = localStorage.getItem("user_id");

  // 1) Cargar restaurantes del usuario al entrar en /app
  useEffect(() => {
    if (!userId) return;

    const loadRestaurants = async () => {
      dispatch({ type: "set_loading", payload: { restaurants: true } });
      try {
        const data = await api.getRestaurants(userId);
        const list = Array.isArray(data.restaurants) ? data.restaurants : [];

        dispatch({ type: "set_restaurants", payload: list });
        dispatch({ type: "set_error", payload: { restaurants: null } });

        // Opcional: si no hay restaurante seleccionado y hay alguno, podríamos autoseleccionar más adelante.
      } catch (err) {
        console.error(err);
        dispatch({
          type: "set_error",
          payload: { restaurants: err.message || "Error cargando restaurantes" },
        });
      } finally {
        dispatch({ type: "set_loading", payload: { restaurants: false } });
      }
    };

    loadRestaurants();
  }, [userId, dispatch]);

  // 2) Cuando el usuario selecciona un restaurante -> cargar dishes + ingredientes + categorías de ese restaurante
  useEffect(() => {
    const rid = store.currentRestaurant?.id;
    if (!rid) return;

    const loadRestaurantData = async () => {
      dispatch({
        type: "set_loading",
        payload: { dishes: true, ingredients: true, categories: true },
      });

      try {
        const [dishesData, ingredientsData, categoriesData] = await Promise.all([
          api.getDishes(rid),
          api.getIngredients(rid),
          api.getCategories(rid),
        ]);

        dispatch({
          type: "set_dishes",
          payload: Array.isArray(dishesData?.dishes) ? dishesData.dishes : [],
        });

        dispatch({
          type: "merge_currentRestaurant",
          payload: {
            ingredients: Array.isArray(ingredientsData?.ingredients)
              ? ingredientsData.ingredients
              : [],
            categories: Array.isArray(categoriesData?.categories)
              ? categoriesData.categories
              : [],
          },
        });

        dispatch({
          type: "set_error",
          payload: { dishes: null, ingredients: null, categories: null },
        });
      } catch (err) {
        console.error(err);
        dispatch({
          type: "set_error",
          payload: {
            dishes: err.message,
            ingredients: err.message,
            categories: err.message,
          },
        });
      } finally {
        dispatch({
          type: "set_loading",
          payload: { dishes: false, ingredients: false, categories: false },
        });
      }
    };

    loadRestaurantData();
  }, [store.currentRestaurant?.id, dispatch]);

  return (
    <div className="home-shell">
      <MasterCard store={store} dispatch={dispatch} />
    </div>
  );
}
