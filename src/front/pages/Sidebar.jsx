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

const Sidebar = ({ sidebarOpen, setSidebarOpen, onOpenRestaurantModal }) => {
  const { store, dispatch } = useGlobalReducer();
  const [restaurants, setRestaurants] = useState([]);
  const user_id = localStorage.getItem("user_id");

  useEffect(() => {
    if (!user_id) return;
    (async () => {
      const r = await fetchJson(`api/user/${user_id}/restaurant`);
      const list = r?.data?.restaurants || r?.data?.restaurants_serialized || [];
      setRestaurants(Array.isArray(list) ? list : []);
    })();
  }, [user_id]);

  const go = (view) => {
    dispatch({ type: "set_currentView", payload: view });
    if (window.innerWidth < 992) setSidebarOpen(false); // cerrar en móviles
  };

  return (
    <aside
      className={`d-flex flex-column text-white p-3 
        ${sidebarOpen ? "d-block" : "d-none"} d-lg-flex`}
      style={{
        width: 220,
        minHeight: "100vh",
        background: "linear-gradient(180deg,#2c5aa0,#325fad)",
        position: window.innerWidth >= 992 ? "static" : "fixed",
        top: 0,
        left: 0,
        zIndex: 1050,
      }}
    >
     
      <div className="d-lg-none mb-3">
        <Button variant="secondary" size="sm" onClick={() => setSidebarOpen(false)}>
          Cerrar
        </Button>
      </div>

      <div className="mb-4">
        <div style={{ fontWeight: 700, fontSize: 18 }}>Panel de control</div>
      </div>

      <nav className="flex-grow-1">
        <ul className="list-unstyled">
          {[
            { view: "dashboard", label: "Resumen" },
            { view: "categories", label: "Categorías" },
            { view: "dishes", label: "Platos" },
            { view: "ingredients", label: "Ingredientes" },
          ].map((item) => (
            <li
              key={item.view}
              className={`py-2 px-2 rounded mt-1 ${
                store.currentView === item.view ? "bg-white text-dark" : ""
              }`}
              onClick={() => go(item.view)}
              style={{ cursor: "pointer" }}
              role="button"
            >
              {item.label}
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto">
        <small className="text-muted">Restaurantes</small>
        <div className="d-flex gap-2 flex-wrap mt-2">
          {restaurants.slice(0, 6).map((r) => (
            <div
              key={r.id || r._id}
              title={r.name}
              onClick={() => {
                dispatch({ type: "set_currentRestaurant", payload: r });
                dispatch({ type: "set_currentView", payload: "categories" });
                if (window.innerWidth < 992) setSidebarOpen(false);
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
            >
              {r.name?.[0] || "R"}
            </div>
          ))}
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
          >
            +
          </Button>
        </div>
        <div className="text-muted small mt-3">© set a meal</div>
      </div>
    </aside>
  );
};

export default Sidebar;
