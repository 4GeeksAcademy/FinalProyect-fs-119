import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import HeroHome from "./HeroHome";
import CategoryList from "./CategoryList";
import RestaurantList from "./RestaurantList";
import { CreateCategoryModal, CreateRestaurantModal } from "../components/Modals";

const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [currentRestaurant, setCurrentRestaurant] = useState(null);
  const [currentView, setCurrentView] = useState(null);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);

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

  
  const saveRestaurant = async ({ name, telefono, direccion }) => {
    try {
      const res = await fetch(`${API_URL}/api/user/${user_id}/restaurant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, telefono, direccion }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Error al crear restaurante");

      const newRestaurant = { ...data.restaurante, categories: [] };
      setRestaurants([...restaurants, newRestaurant]);
      setCurrentRestaurant(newRestaurant);
      setCurrentView("categories");
      setShowRestaurantModal(false);
    } catch (err) {
      console.error(err);
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
        setCurrentView(null);
      }
    } catch (err) {
      console.error("Error eliminando restaurante:", err);
    }
  };

  
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
      setRestaurants(restaurants.map((r) => (r.id === currentRestaurant.id ? { ...r, categories } : r)));
      setShowCategoryModal(false);
    } catch (err) {
      console.error(err);
    }
  };

 
  const deleteCategory = async (categoryId) => {
    if (!currentRestaurant) return;

    try {
      const res = await fetch(`${API_URL}/api/restaurant/${currentRestaurant.id}/categories/${categoryId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Error eliminando categoría");

      
      const categoriesRes = await fetch(`${API_URL}/api/restaurant/${currentRestaurant.id}/categories`);
      const categoriesData = await categoriesRes.json();
      const categories = categoriesData.categories || [];

      setCurrentRestaurant({ ...currentRestaurant, categories });
      setRestaurants(restaurants.map((r) => (r.id === currentRestaurant.id ? { ...r, categories } : r)));
    } catch (err) {
      console.error("Error eliminando categoría:", err);
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#F0E5CF" }}>
      
      <div
        style={{
          width: "80px",
          backgroundColor: "#1B1B1B",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "10px 0",
        }}
      >
        <Sidebar onOpenRestaurantModal={() => setShowRestaurantModal(true)} />
      </div>

      
      <div className="flex-grow-1 p-4">
        

        
        <div className="mb-4">
          <h3 style={{ color: "#4B6587" }}>Restaurantes</h3>
          <RestaurantList
            restaurants={restaurants}
            onDelete={deleteRestaurant}
            onSelect={selectRestaurant}
          />
        </div>

        
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
      </div>

      
      <CreateCategoryModal
        show={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSave={saveCategory}
      />

      <CreateRestaurantModal
        show={showRestaurantModal}
        onClose={() => setShowRestaurantModal(false)}
        onSave={saveRestaurant}
      />
    </div>
  );
};

export default Home;
