import { apiFetch } from "./apiClient";

export const api = {
  // AUTH
  login: (payload) => apiFetch("/api/user/login", { method: "POST", body: payload }),
  register: (payload) => apiFetch("/api/user/register", { method: "POST", body: payload }),
  profile: (userId) => apiFetch(`/api/user/profile/${userId}`),

  // RESTAURANTS
  createRestaurant: (userId, payload) =>
    apiFetch(`/api/user/${userId}/restaurant`, { method: "POST", body: payload }),
  getRestaurants: (userId) =>
    apiFetch(`/api/user/${userId}/restaurant`),

  // CATEGORIES
  getCategories: (restaurantId) =>
    apiFetch(`/api/restaurant/${restaurantId}/categories`),
  createCategory: (restaurantId, payload) =>
    apiFetch(`/api/restaurant/${restaurantId}/categories`, { method: "POST", body: payload }),

  // INGREDIENTS
  getIngredients: (restaurantId) =>
    apiFetch(`/api/restaurant/${restaurantId}/ingredients`),
  createIngredient: (restaurantId, payload) =>
    apiFetch(`/api/restaurant/${restaurantId}/ingredients`, { method: "POST", body: payload }),

  // DISHES
  getDishes: (restaurantId) =>
    apiFetch(`/api/restaurant/${restaurantId}/dishes`),
  getDishDetail: (restaurantId, dishId) =>
    apiFetch(`/api/restaurant/${restaurantId}/dishes/${dishId}`),
  createDish: (restaurantId, payload) =>
    apiFetch(`/api/restaurant/${restaurantId}/dishes`, { method: "POST", body: payload }),

  // DISH-INGREDIENT LINES
  addIngredientToDish: (restaurantId, dishId, payload) =>
    apiFetch(`/api/restaurant/${restaurantId}/dishes/${dishId}/ingredients`, { method: "POST", body: payload }),
};
