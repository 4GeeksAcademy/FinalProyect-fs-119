import React, { useState } from "react";

export const NavbarUser = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top shadow-sm" style={{ backgroundColor: "#4B6587" }}>
      <div className="container-fluid">
        <a className="navbar-brand fs-2 fw-bold" href="/home" style={{ fontFamily: "Brush Script MT, cursive", color: "#F9C784" }}>
          DISHCOST
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
        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`} id="navbarUserNav">
          <ul className="navbar-nav ms-auto align-items-lg-center">
            <li className="nav-item mx-2"><a href="/home" className="nav-link text-white fw-semibold">Principal</a></li>
            <li className="nav-item mx-2"><a href="/ingredients" className="nav-link text-white fw-semibold">Ingredientes</a></li>
            <li className="nav-item mx-2"><a href="/dishes" className="nav-link text-white fw-semibold">Platos</a></li>
            <li className="nav-item mx-2"><a href="/profile" className="nav-link text-white fw-semibold">Perfil</a></li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
