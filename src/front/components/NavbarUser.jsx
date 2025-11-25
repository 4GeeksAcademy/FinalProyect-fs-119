import React, { useState } from "react";

export const NavbarUser = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark sticky-top shadow-sm"
      style={{ backgroundColor: "#4B6587" }}
    >
      <div className="container-fluid">
        <a
          className="navbar-brand fs-2 fw-bold"
          href="/home"
          style={{ fontFamily: "sans-serif Klavika", color: "#2ce8ff" }}
        >
          setameal
        </a>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-controls="navbarUserNav"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}
          id="navbarUserNav"
        >
          <ul className="navbar-nav ms-auto align-items-lg-center">
            <li className="nav-item mx-2">
              <a href="/ingredients" className="nav-link text-white fw-semibold">
                Ingredientes
              </a>
            </li>

            <li className="nav-item mx-2">
              <a href="/dishes" className="nav-link text-white fw-semibold">
                Platos
              </a>
            </li>
            <li className="nav-item dropdown mx-2">
              <a
                className="nav-link dropdown-toggle text-white fw-semibold"
                href="#"
                id="perfilDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Perfil
              </a>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="perfilDropdown">
                <li>
                  <a className="dropdown-item" href="/profile">
                    Ver perfil
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="/settings">
                    Ajustes
                  </a>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a className="dropdown-item" href="/logout">
                    Cerrar sesión
                  </a>
                </li>
              </ul>
            </li>

          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavbarUser;
