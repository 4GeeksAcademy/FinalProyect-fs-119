import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import CategoryList from "./CategoryList";
import RestaurantList from "./RestaurantList";
import IngredientList from "./IngredientList";
import {
  CreateCategoryModal,
  CreateRestaurantModal,
  CreateIngredientModal,
} from "../components/Modals";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [currentRestaurant, setCurrentRestaurant] = useState(null);
  const [currentView, setCurrentView] = useState("restaurants");

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);
  const [showIngredientModal, setShowIngredientModal] = useState(false);

  const user_id = localStorage.getItem("user_id");

 
  useEffect(() => {
    if (!user_id) return;
    const fetchRestaurants = async () => {
      try {
        const res = await fetch(`${API_URL}/api/user/${user_id}/restaurant`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || "Error al cargar restaurantes");
        setRestaurants(data.restaurants);
      } catch (err) {
        console.error("Error al cargar restaurantes:", err);
      }
    };
    fetchRestaurants();
  }, [user_id]);

  
  const selectRestaurant = async (restaurant) => {
    setCurrentRestaurant(restaurant);
    setCurrentView("categories");
    try {
      const res = await fetch(`${API_URL}/api/restaurant/${restaurant.id}/categories`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Error al cargar categorías");
      setCurrentRestaurant({ ...restaurant, categories: data.categories });
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  };

  
  const saveRestaurant = async ({ name, telefono, direccion }) => {
    try {
      const res = await fetch(`${API_URL}/api/user/${user_id}/restaurant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, telefono, direccion }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Error al crear restaurante");
      const newRestaurant = { ...data.restaurante, categories: [], ingredients: [] };
      setRestaurants([...restaurants, newRestaurant]);
      setCurrentRestaurant(newRestaurant);
      setCurrentView("categories");
      setShowRestaurantModal(false);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  
  const deleteRestaurant = async (restaurantId) => {
    try {
      const res = await fetch(`${API_URL}/api/user/${user_id}/restaurant/${restaurantId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Error eliminando restaurante");
      setRestaurants(restaurants.filter((r) => r.id !== restaurantId));
      if (currentRestaurant?.id === restaurantId) {
        setCurrentRestaurant(null);
        setCurrentView("restaurants");
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  
  const saveCategory = async (name) => {
  if (!currentRestaurant) return;
  try {
    const res = await fetch(`${API_URL}/api/restaurant/${currentRestaurant.id}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || "Error al crear categoría");

    
    const categoriesRes = await fetch(`${API_URL}/api/restaurant/${currentRestaurant.id}/categories`);
    const categoriesData = await categoriesRes.json();
    const categories = categoriesData.categories || [];

    setCurrentRestaurant({ ...currentRestaurant, categories }); 
    setRestaurants(
      restaurants.map((r) =>
        r.id === currentRestaurant.id ? { ...r, categories } : r
      )
    );

    setShowCategoryModal(false); 
  } catch (err) {
    console.error(err);
  }
};

  
  const deleteCategory = async (categoryId) => {
    if (!currentRestaurant) return;
    try {
      const res = await fetch(
        `${API_URL}/api/restaurant/${currentRestaurant.id}/categories/${categoryId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Error eliminando categoría");
      const updatedCategories = (currentRestaurant.categories || []).filter((c) => c.id !== categoryId);
      setCurrentRestaurant({ ...currentRestaurant, categories: updatedCategories });
      setRestaurants(
        restaurants.map((r) =>
          r.id === currentRestaurant.id ? { ...r, categories: updatedCategories } : r
        )
      );
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  
  const loadIngredients = async () => {
    if (!currentRestaurant) return;
    try {
      const res = await fetch(`${API_URL}/api/restaurant/${currentRestaurant.id}/ingredients`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Error al cargar ingredientes");
      setCurrentRestaurant({ ...currentRestaurant, ingredients: data.ingredients });
    } catch (err) {
      console.error(err);
    }
  };

  
const saveIngredient = async (ingredientData) => {
  if (!currentRestaurant) return;

  try {
    const res = await fetch(
      `${API_URL}/api/restaurant/${currentRestaurant.id}/ingredients`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ingredientData),
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || "Error al crear ingrediente");

    
    const resIngredients = await fetch(
      `${API_URL}/api/restaurant/${currentRestaurant.id}/ingredients`
    );
    const dataIngredients = await resIngredients.json();

    setCurrentRestaurant({
      ...currentRestaurant,
      ingredients: dataIngredients.ingredients || [],
    });

    setShowIngredientModal(false);
  } catch (err) {
    console.error("Error creando ingrediente:", err);
    alert(err.message);
  }
};

  
  const deleteIngredient = async (id) => {
    try {
      const res = await fetch(
        `${API_URL}/api/restaurant/${currentRestaurant.id}/ingredients/${id}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Error eliminando ingrediente");
      await loadIngredients();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#F0E5CF" }}>
      <Sidebar
        onOpenRestaurantModal={() => setShowRestaurantModal(true)}
        onChangeView={(view) => {
          setCurrentView(view);
          if (view === "ingredients") loadIngredients();
        }}
      />

      <div className="flex-grow-1 p-4">
        <h3 style={{ color: "#4B6587" }}>Restaurantes</h3>
        <RestaurantList
          restaurants={restaurants}
          onSelect={selectRestaurant}
          onDelete={deleteRestaurant}
        />

        {currentView === "categories" && currentRestaurant && (
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3 style={{ color: "#4B6587" }}>
                Categorías de {currentRestaurant.name}
              </h3>
              <button
                className="btn btn-primary rounded-circle"
                onClick={() => setShowCategoryModal(true)}
              >
                +
              </button>
            </div>
            <CategoryList
              categories={currentRestaurant.categories || []}
              onDelete={deleteCategory}
            />
          </div>
        )}

        {currentView === "ingredients" && currentRestaurant && (
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3 style={{ color: "#4B6587" }}>
                Ingredientes de {currentRestaurant.name}
              </h3>
              <button
                className="btn btn-primary rounded-circle"
                onClick={() => setShowIngredientModal(true)}
              >
                +
              </button>
            </div>
            <IngredientList
              ingredients={currentRestaurant.ingredients || []}
              onDelete={deleteIngredient}
            />
          </div>
        )}
      </div>

      
      <CreateRestaurantModal
        show={showRestaurantModal}
        onClose={() => setShowRestaurantModal(false)}
        onSave={saveRestaurant}
      />
      <CreateCategoryModal
        show={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSave={saveCategory}
      />
   <CreateIngredientModal
  show={showIngredientModal}
  onClose={() => setShowIngredientModal(false)}
  onSave={saveIngredient}
/>

    </div>
  );
};

export default Home;
