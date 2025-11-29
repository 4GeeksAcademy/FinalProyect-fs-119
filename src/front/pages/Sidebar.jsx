import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import RestaurantList from "./RestaurantList";
import useGlobalReducer from "../hooks/useGlobalReducer";

const API = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

const Sidebar = ({ onOpenRestaurantModal }) => {
  const { store, dispatch } = useGlobalReducer();
  const [restaurants, setRestaurants] = useState([]);
  const user_id = localStorage.getItem("user_id");

  useEffect(() => {
    if (!user_id) return;
    const fetchRestaurants = async () => {
      try {
        const res = await fetch(`${API}/api/user/${user_id}/restaurant`);
        const data = await res.json();
        if (res.ok) setRestaurants(data.restaurants || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchRestaurants();
  }, [user_id]);

  const go = (view) => dispatch({ type: "set_currentView", payload: view });

  return (
    <aside style={{ width: 220, minHeight: "100vh", background: "linear-gradient(180deg,#2c5aa0,#325fad)" }} className="d-flex flex-column text-white p-3">
      <div className="mb-4 d-flex align-items-center gap-2">
        <div style={{ width: 44, height: 44, borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#325fad", fontWeight: 700 }}>
          C
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>set a meal</div>
          <div style={{ fontSize: 12, opacity: 0.85 }}>Control Panel</div>
        </div>
      </div>

      <nav className="flex-grow-1">
        <ul className="list-unstyled">
          <li className={`py-2 px-2 rounded ${store.currentView === "dashboard" ? "bg-white text-dark" : ""}`} onClick={() => go("dashboard")} style={{ cursor: "pointer" }}>
            Dashboard
          </li>
          <li className={`py-2 px-2 rounded mt-1 ${store.currentView === "dishes" ? "bg-white text-dark" : ""}`} onClick={() => go("dishes")} style={{ cursor: "pointer" }}>
            Dishes
          </li>
          <li className={`py-2 px-2 rounded mt-1 ${store.currentView === "ingredients" ? "bg-white text-dark" : ""}`} onClick={() => go("ingredients")} style={{ cursor: "pointer" }}>
            Ingredients
          </li>
          <li className={`py-2 px-2 rounded mt-1 ${store.currentView === "categories" ? "bg-white text-dark" : ""}`} onClick={() => go("categories")} style={{ cursor: "pointer" }}>
            Categories
          </li>
        </ul>
      </nav>

      <div className="mt-auto">
        <div className="mb-2">
          <small className="text-muted">Restaurantes</small>
          <div className="d-flex gap-2 flex-wrap mt-2">
            {restaurants.slice(0,6).map((r) => (
              <div key={r.id} title={r.name} onClick={() => {
                dispatch({ type: "set_currentRestaurant", payload: r });
                dispatch({ type: "set_currentView", payload: "categories" });
              }} style={{ width: 40, height: 40, borderRadius: 20, background: "#F0E5CF", display: "flex", alignItems: "center", justifyContent: "center", color: "#4B6587", cursor: "pointer" }}>
                {r.name?.[0] || "R"}
              </div>
            ))}
            <div style={{ width: 40, height: 40, borderRadius: 20 }}>
              <Button className="p-0" style={{ width: 40, height: 40, borderRadius: 20, background: "#F9C784", color: "#4B6587", border: "none" }} onClick={onOpenRestaurantModal}>+</Button>
            </div>
          </div>
        </div>

        <div className="text-muted small mt-3">© set a meal</div>
      </div>
    </aside>
  );
};

export default Sidebar;
