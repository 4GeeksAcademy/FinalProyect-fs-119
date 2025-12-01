// src/front/v2/services/api.js
import { apiFetch } from "./apiClient";

export const api = {
  // AUTH
  login: (payload) =>
    apiFetch("/api/user/login", { method: "POST", body: payload }),

  register: (payload) =>
    apiFetch("/api/user/register", { method: "POST", body: payload }),

  profile: (userId) =>
    apiFetch(`/api/user/profile/${userId}`),

  // RESTAURANTS
  createRestaurant: (userId, payload) =>
    apiFetch(`/api/user/${userId}/restaurant`, {
      method: "POST",
      body: payload,
    }),

  getRestaurants: (userId) =>
    apiFetch(`/api/user/${userId}/restaurant`),

  // CATEGORIES
  getCategories: (restaurantId) =>
    apiFetch(`/api/restaurant/${restaurantId}/categories`),

  createCategory: (restaurantId, payload) =>
    apiFetch(`/api/restaurant/${restaurantId}/categories`, {
      method: "POST",
      body: payload,
    }),

  deleteCategory: (restaurantId, categoryId) =>
    apiFetch(`/api/restaurant/${restaurantId}/categories/${categoryId}`, {
      method: "DELETE",
    }),

  // INGREDIENTS
  getIngredients: (restaurantId) =>
    apiFetch(`/api/restaurant/${restaurantId}/ingredients`),

  createIngredient: (restaurantId, payload) =>
    apiFetch(`/api/restaurant/${restaurantId}/ingredients`, {
      method: "POST",
      body: payload,
    }),

  deleteIngredient: (restaurantId, ingredientId) =>
    apiFetch(
      `/api/restaurant/${restaurantId}/ingredients/${ingredientId}`,
      { method: "DELETE" }
    ),

  // DISHES
  getDishes: (restaurantId) =>
    apiFetch(`/api/restaurant/${restaurantId}/dishes`),

  getDishDetail: (restaurantId, dishId) =>
    apiFetch(`/api/restaurant/${restaurantId}/dishes/${dishId}`),

  createDish: (restaurantId, payload) =>
    apiFetch(`/api/restaurant/${restaurantId}/dishes`, {
      method: "POST",
      body: payload,
    }),

  deleteDish: (restaurantId, dishId) =>
    apiFetch(`/api/restaurant/${restaurantId}/dishes/${dishId}`, {
      method: "DELETE",
    }),

  getDish: (restaurantId, dishId) =>
    apiFetch(`/api/restaurant/${restaurantId}/dishes/${dishId}`),

  // DISH-INGREDIENT LINES
  addDishIngredient: (restaurantId, dishId, payload) =>
    apiFetch(
      `/api/restaurant/${restaurantId}/dishes/${dishId}/ingredients`,
      {
        method: "POST",
        body: payload,       // 👈 OBJETO, SIN JSON.stringify
      }
    ),

  // Alias opcional, mismo endpoint
  addIngredientToDish: (restaurantId, dishId, payload) =>
    apiFetch(
      `/api/restaurant/${restaurantId}/dishes/${dishId}/ingredients`,
      {
        method: "POST",
        body: payload,
      }
    ),
  
   // OPENFOOD (externa via tu backend)
  openFoodSearch: (q) =>
    apiFetch(`/api/openfood/search?q=${encodeURIComponent(q)}`),

  openFoodByBarcode: (code) =>
    apiFetch(`/api/openfood/barcode/${encodeURIComponent(code)}`),
  
  
};
