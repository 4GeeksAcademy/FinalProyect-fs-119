import React from "react";
import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav
       className="navbar navbar-expand-lg navbar-dark sticky-top shadow-sm"
      style={{ backgroundColor: "#4B6587" }}
    >
      <div className="container-fluid">
        
        <Link
          to="/"
          className="navbar-brand fs-2 fw-bold"
          style={{
            fontFamily: "Brush Script MT, cursive",
            color: "#F9C784",
            textDecoration: "none",
          }}
        >
          DISHCOST
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav align-items-lg-center">
            <li className="nav-item mx-2">
              <Link to="/" className="nav-link text-white fw-semibold">
                Inicio
              </Link>
            </li>
            
            <li className="nav-item mx-2">
              <Link to="/contact" className="nav-link text-white fw-semibold">
                Contacto
              </Link>
            </li>
            <li className="nav-item mx-2">
              <Link
                to="/login"
                className="btn btn-sm me-2"
                style={{
                  backgroundColor: "#F9C784",
                  color: "#4B6587",
                  fontWeight: "bold",
                  border: "none",
                }}
              >
                Iniciar sesión
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/register"
                className="btn btn-sm"
                style={{
                  backgroundColor: "#F0E5CF",
                  color: "#4B6587",
                  fontWeight: "bold",
                  border: "none",
                }}
              >
                Regístrate
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};