import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import HeroHome from "./HeroHome";
import CategoryList from "./CategoryList";
import RestaurantList from "./RestaurantList";

const CreateCategoryModal = ({ show, onClose, onSave }) => {
  const [name, setName] = useState("");
  if (!show) return null;

  const backdropStyle = {
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
  };
  const modalStyle = {
    background: "white", padding: "20px", borderRadius: "8px", width: "400px", maxWidth: "90%"
  };

  return (
    <div style={backdropStyle}>
      <div style={modalStyle}>
        <h3>Crear Categoría</h3>
        <input className="form-control my-2" placeholder="Nombre de categoría" value={name} onChange={(e) => setName(e.target.value)} />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn-secondary me-2" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => { onSave(name); setName(""); }}>Crear</button>
        </div>
      </div>
    </div>
  );
};

const CreateRestaurantModal = ({ show, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  if (!show) return null;

  const backdropStyle = {
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
  };
  const modalStyle = {
    background: "white", padding: "20px", borderRadius: "8px", width: "400px", maxWidth: "90%"
  };

  const handleSave = () => {
    if (!name || !telefono || !direccion) return;
    onSave({ name, telefono, direccion });
    setName(""); setTelefono(""); setDireccion("");
  };

  return (
    <div style={backdropStyle}>
      <div style={modalStyle}>
        <h3>Crear Restaurante</h3>
        <input className="form-control my-2" placeholder="Nombre del restaurante" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="form-control my-2" placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        <input className="form-control my-2" placeholder="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn-secondary me-2" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave}>Crear</button>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
  const [restaurants, setRestaurants] = useState([]);
  const [currentRestaurant, setCurrentRestaurant] = useState(null);
  const [currentView, setCurrentView] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesRes = await fetch(`${API_URL}/api/categories`);
        const categoriesData = await categoriesRes.json();
        const restaurantsRes = await fetch(`${API_URL}/api/restaurants`);
        const restaurantsData = await restaurantsRes.json();
        const withCategories = restaurantsData.map(r => ({ ...r, categories: r.categories || [] }));
        setRestaurants(withCategories);
      } catch {}
    };
    fetchData();
  }, []);

  const saveRestaurant = ({ name, telefono, direccion }) => {
    const newRestaurant = { id: Date.now(), name, telefono, direccion, categories: [] };
    setRestaurants([...restaurants, newRestaurant]);
    setShowRestaurantModal(false);
    setCurrentRestaurant(newRestaurant);
    setCurrentView("categories");
  };

  const deleteRestaurant = (id) => {
    setRestaurants(restaurants.filter(r => r.id !== id));
    if (currentRestaurant && currentRestaurant.id === id) {
      setCurrentRestaurant(null);
      setCurrentView(null);
    }
  };

  const saveCategory = (name) => {
    if (!currentRestaurant) return;
    const updatedRestaurant = { ...currentRestaurant, categories: [...currentRestaurant.categories, { id: Date.now(), name }] };
    setRestaurants(restaurants.map(r => r.id === updatedRestaurant.id ? updatedRestaurant : r));
    setCurrentRestaurant(updatedRestaurant);
    setShowCategoryModal(false);
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#F0E5CF" }}>
      <div style={{ width: "80px", backgroundColor: "#1B1B1B", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0" }}>
        <Sidebar onOpenRestaurantModal={() => setShowRestaurantModal(true)} />
      </div>

      <div className="flex-grow-1 p-4">
        <HeroHome />

        <div className="mb-4">
          <h3 style={{ color: "#4B6587" }}>Restaurantes</h3>
          <RestaurantList restaurants={restaurants} onDelete={deleteRestaurant} />
        </div>

        {currentView === "categories" && currentRestaurant && (
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3 style={{ color: "#4B6587" }}>Categorías de {currentRestaurant.name}</h3>
              <button className="btn btn-primary rounded-circle" onClick={() => setShowCategoryModal(true)}>+</button>
            </div>
            <CategoryList categories={currentRestaurant.categories} />
          </div>
        )}
      </div>

      <CreateCategoryModal show={showCategoryModal} onClose={() => setShowCategoryModal(false)} onSave={saveCategory} />
      <CreateRestaurantModal show={showRestaurantModal} onClose={() => setShowRestaurantModal(false)} onSave={saveRestaurant} />
    </div>
  );
};

export default Home;
