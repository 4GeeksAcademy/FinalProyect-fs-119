export const initialStore = () => ({
  currentView: "restaurants",
  currentRestaurant: null,
  restaurants: [],
  dishes: [],
  loading: {
    restaurants: false,
    categories: false,
    ingredients: false,
    dishes: false,
  },
  error: {
    restaurants: null,
    categories: null,
    ingredients: null,
    dishes: null,
  },
  ui: {
    showRestaurantModal: false,
    showCategoryModal: false,
    showIngredientModal: false,
    showDishModal: false,
  },
  selectedCategory: null,
});

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "set_currentView":
      return { ...store, currentView: action.payload };

    case "set_currentRestaurant":
      return { ...store, currentRestaurant: action.payload };

    case "merge_currentRestaurant":
      return { ...store, currentRestaurant: { ...(store.currentRestaurant || {}), ...action.payload } };

    case "set_restaurants":
      return { ...store, restaurants: action.payload };

    case "add_restaurant":
      return { ...store, restaurants: [...store.restaurants, action.payload] };

    case "remove_restaurant":
      return { ...store, restaurants: store.restaurants.filter(r => r.id !== action.payload) };

    case "set_dishes":
      return { ...store, dishes: action.payload };

    case "add_dish":
      return { ...store, dishes: [...store.dishes, action.payload] };

    case "remove_dish":
      return { ...store, dishes: store.dishes.filter(d => d.id !== action.payload) };

    case "update_dish":
      return {
        ...store,
        dishes: store.dishes.map(d => (d.id === action.payload.id ? { ...d, ...action.payload } : d)),
      };

    case "set_loading":
      return { ...store, loading: { ...store.loading, ...action.payload } };

    case "set_error":
      return { ...store, error: { ...store.error, ...action.payload } };

    case "ui_set":
      return { ...store, ui: { ...store.ui, ...action.payload } };

    case "set_selectedCategory":
      return { ...store, selectedCategory: action.payload };

    default:
      throw new Error("Unknown action.");
  }
}
