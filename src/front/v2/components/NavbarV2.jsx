// src/front/v2/components/NavbarV2.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import "../../components/AnimatedNavbrand.css";
import { AnimatedNavbrand } from "../../components/AnimatedNavbrand";

const NavbarV2 = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    setIsLogged(!!token);
  }, []);

  const handleLogout = () => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");
      // si en el futuro guardas más cosas de sesión, se limpian aquí

      // recarga limpia hacia login
      window.location.assign("/login");
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light shadow-sm"
      style={{
        backgroundColor: "#ffffff",
        minHeight: "72px",
      }}
    >
      <div className="container-fluid d-flex align-items-center">
        {/* BRAND IZQUIERDA: logo + navbrand animado */}
        <Link
          to="/"
          className="navbar-brand d-flex align-items-center text-decoration-none me-3"
        >
          <img
            src="/logoMauri.svg"
            alt="Logo setameal"
            style={{
              height: "40px",
              display: "block",
              marginRight: "10px",
            }}
          />
          {/* Tu navbrand animado existente */}
          <AnimatedNavbrand />
        </Link>

        {/* TOGGLER MOBILE */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-controls="navbarV2"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* CONTENIDO DERECHA */}
        <div
          className={`collapse navbar-collapse justify-content-end ${
            isOpen ? "show" : ""
          }`}
          id="navbarV2"
        >
          <ul className="navbar-nav align-items-lg-center">
            {/* Versión pública: Login + Register */}
            {!isLogged && (
              <>
                <li className="nav-item mx-1">
                  <Link className="btn btn-outline-primary" to="/login">
                    Iniciar sesión
                  </Link>
                </li>
                <li className="nav-item mx-1 mt-2 mt-lg-0">
                  <Link className="btn btn-primary" to="/register">
                    Crear cuenta
                  </Link>
                </li>
              </>
            )}

            {/* Versión privada: Cerrar sesión */}
            {isLogged && (
              <li className="nav-item mx-1">
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavbarV2;
