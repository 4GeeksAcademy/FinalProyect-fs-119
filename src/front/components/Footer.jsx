import React from "react";

export const Footer = () => {
  return (
    <footer
      className="text-center text-lg-start text-white mt-auto"
      style={{ backgroundColor: "#4B6587" }}
    >
      <div className="container p-4">
        <div className="row">
          
          <div className="col-lg-6 col-md-12 mb-4 mb-md-0">
            <h5 className="fw-bold" style={{ color: "#F9C784" }}>
              Dishcost
            </h5>
            <p>
              Una herramienta diseñada para ayudarte a controlar los escandallos,
              optimizar los costes y mejorar la rentabilidad de tu restaurante o
              hotel. Precisión, control y eficiencia en un solo lugar.
            </p>
          </div>

          
          <div className="col-lg-3 col-md-6 mb-4 mb-md-0">
            <h6 className="text-uppercase fw-bold" style={{ color: "#F9C784" }}>
              Enlaces útiles
            </h6>
            <ul className="list-unstyled mb-0">
              <li><a href="/" className="text-white text-decoration-none">Inicio</a></li>
              <li><a href="/about" className="text-white text-decoration-none">Sobre nosotros</a></li>
              <li><a href="/contact" className="text-white text-decoration-none">Contacto</a></li>
              <li><a href="/login" className="text-white text-decoration-none">Iniciar sesión</a></li>
            </ul>
          </div>

          
          <div className="col-lg-3 col-md-6 mb-4 mb-md-0">
            <h6 className="text-uppercase fw-bold" style={{ color: "#F9C784" }}>
              Síguenos
            </h6>
            <div>
              <a href="#" className="text-white mx-2"><i className="bi bi-facebook fs-5"></i></a>
              <a href="#" className="text-white mx-2"><i className="bi bi-instagram fs-5"></i></a>
              <a href="#" className="text-white mx-2"><i className="bi bi-linkedin fs-5"></i></a>
              <a href="#" className="text-white mx-2"><i className="bi bi-github fs-5"></i></a>
            </div>
          </div>
        </div>
      </div>

      
      <div
        className="text-center py-3"
        style={{ backgroundColor: "#3b4a63", fontSize: "0.9rem" }}
      >
        © {new Date().getFullYear()} Dishcost — Todos los derechos reservados
      </div>
    </footer>
  );
};