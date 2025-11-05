import React from "react";
import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg" style={{ backgroundColor: "#6c8ca1" }}>
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <Link
          to="/"
          className="navbar-brand text-white fs-2 fw-bold"
          style={{ fontFamily: "Brush Script MT, cursive", textDecoration: "none" }}
        >
          DISHCOST
        </Link>

        <div>
          <Link to="/login" className="btn btn-sm me-2" style={{ backgroundColor: "#b0c4de", fontWeight: "bold" }}>
            LOGIN
          </Link>
          <Link to="/register" className="btn btn-sm" style={{ backgroundColor: "#b0c4de", fontWeight: "bold" }}>
            SIGNUP
          </Link>
        </div>
      </div>
    </nav>
  );
};