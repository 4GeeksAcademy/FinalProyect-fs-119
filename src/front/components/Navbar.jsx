import React from "react";
import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav
      className="navbar navbar-expand-lg shadow-sm"
      style={{ backgroundColor: "#ffffff" }}
    >
      <div className="container-fluid">
        <Link
          to="/"
          className="navbar-brand d-flex align-items-center"
          style={{ textDecoration: "none" }}
        >
          <img
            src="/ElLogoDefinitivo.svg"
            alt="Set a meal logo"
            style={{ height: 32, marginRight: 8 }}
          />
          <span
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "#18498b",
              lineHeight: 1,
            }}
          >
            set a meal
          </span>
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

        <div
          className="collapse navbar-collapse justify-content-end"
          id="navbarNav"
        >
          <ul className="navbar-nav align-items-lg-center">
            <li className="nav-item mx-3">
              <Link
                to="/logister?mode=register"
                className="nav-link"
                style={{ color: "#18498b", fontWeight: 500 }}
              >
                Registrate
              </Link>
            </li>
            <li className="nav-item mx-3">
              <Link
                to="/logister?mode=login"
                className="nav-link"
                style={{ color: "#18498b", fontWeight: 500 }}
              >
                Inicia Sesion
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
