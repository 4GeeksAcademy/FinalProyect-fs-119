import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import useGlobalReducer from "../hooks/useGlobalReducer";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "";

async function fetchJson(path, opts = {}) {
  try {
    const url = new URL(path.replace(/^\//, ""), API_BASE).toString();
    const res = await fetch(url, opts);
    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data, res };
  } catch (err) {
    return { ok: false, status: null, data: null, error: err };
  }
}

const Sidebar = ({ onOpenRestaurantModal }) => {
  const { store, dispatch } = useGlobalReducer();
  const [restaurants, setRestaurants] = useState([]);
  const user_id = localStorage.getItem("user_id");

  useEffect(() => {
    if (!user_id) return;
    (async () => {
      const r = await fetchJson(`api/user/${user_id}/restaurant`);
      const list =
        r?.data?.restaurants || r?.data?.restaurants_serialized || [];
      setRestaurants(Array.isArray(list) ? list : []);
    })();
  }, [user_id]);

  const go = (view) => dispatch({ type: "set_currentView", payload: view });

  return (
    <aside
      style={{
        width: 220,
        minHeight: "100vh",
        background: "linear-gradient(180deg,#2c5aa0,#325fad)",
      }}
      className="d-flex flex-column text-white p-3"
    >
      <div className="mb-4">
        <div style={{ fontWeight: 700, fontSize: 18 }}>Panel de control</div>
      </div>

      <nav className="flex-grow-1">
        <ul className="list-unstyled">
          <li
            className={`py-2 px-2 rounded ${
              store.currentView === "dashboard" ? "bg-white text-dark" : ""
            }`}
            onClick={() => go("dashboard")}
            style={{ cursor: "pointer" }}
            role="button"
            aria-label="Ir al resumen"
          >
            Resumen
          </li>
          <li
            className={`py-2 px-2 rounded mt-1 ${
              store.currentView === "categories" ? "bg-white text-dark" : ""
            }`}
            onClick={() => go("categories")}
            style={{ cursor: "pointer" }}
            role="button"
            aria-label="Ver categorías"
          >
            Categorías
          </li>
          <li
            className={`py-2 px-2 rounded mt-1 ${
              store.currentView === "dishes" ? "bg-white text-dark" : ""
            }`}
            onClick={() => go("dishes")}
            style={{ cursor: "pointer" }}
            role="button"
            aria-label="Ver platos"
          >
            Platos
          </li>
          <li
            className={`py-2 px-2 rounded mt-1 ${
              store.currentView === "ingredients" ? "bg-white text-dark" : ""
            }`}
            onClick={() => go("ingredients")}
            style={{ cursor: "pointer" }}
            role="button"
            aria-label="Ver ingredientes"
          >
            Ingredientes
          </li>
        </ul>
      </nav>

      <div className="mt-auto">
        <div className="mb-2">
          <small className="text-muted">Restaurantes</small>
          <div className="d-flex gap-2 flex-wrap mt-2">
            {restaurants.slice(0, 6).map((r) => (
              <div
                key={r.id || r._id}
                title={r.name}
                onClick={() => {
                  dispatch({ type: "set_currentRestaurant", payload: r });
                  dispatch({ type: "set_currentView", payload: "categories" });
                }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  background: "#F0E5CF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#4B6587",
                  cursor: "pointer",
                }}
                aria-label={`Seleccionar restaurante ${r.name}`}
              >
                {r.name?.[0] || "R"}
              </div>
            ))}
            <div style={{ width: 40, height: 40, borderRadius: 20 }}>
              <Button
                className="p-0"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  background: "#F9C784",
                  color: "#4B6587",
                  border: "none",
                }}
                onClick={onOpenRestaurantModal}
                title="Añadir restaurante"
                aria-label="Añadir restaurante"
              >
                +
              </Button>
            </div>
          </div>
        </div>
        <div className="text-muted small mt-3">© set a meal</div>
      </div>
    </aside>
  );
};

export default Sidebar;
