import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./AppLayout.css";

export default function AppLayout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    // opcional: localStorage.removeItem("restaurant_id");
    navigate("/login");
  };

  const linkClass = ({ isActive }) => `v2-link ${isActive ? "active" : ""}`;

  return (
    <div className="v2-shell">
      <aside className="v2-sidebar">
        <div className="v2-brand">
          <span className="v2-brand-icon">🍽️</span>
          <span className="v2-brand-text">set a meal</span>
        </div>

        <nav className="v2-nav">
          <NavLink to="/app" end className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/app/dishes" className={linkClass}>
            Platos
          </NavLink>
          <NavLink to="/app/ingredients" className={linkClass}>
            Ingredientes
          </NavLink>
          <NavLink to="/app/onboarding" className={linkClass}>
            Onboarding
          </NavLink>
        </nav>

        <div className="v2-sidebar-footer">
          <button className="v2-logout" onClick={logout}>
            🚪 Salir
          </button>
        </div>
      </aside>

      <main className="v2-main">
        <Outlet />
      </main>
    </div>
  );
}
