import React from "react";
import { Cards } from "../components/Cards";

export const Home = () => {
  return (
    <div
      className="d-flex flex-column min-vh-100 bg-light"
      style={{
        backgroundImage: "url('/fondo-cocina.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      
      <main className="flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center text-white py-5"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.55)",
        }}
      >
        <h1 className="fw-bold mb-3" style={{ fontSize: "3rem", color: "#F9C784" }}>
          Optimiza tus escandallos con Dishcost
        </h1>
        <p className="fs-5 mb-4" style={{ maxWidth: "700px" }}>
          Controla los costes de tus platos, mejora la rentabilidad y gestiona
          tu restaurante o hotel con precisión y estilo.
        </p>
        <a href="#cards" className="btn btn-lg" style={{ backgroundColor: "#F9C784", color: "#4B6587", fontWeight: "bold" }}>
          Explora más
        </a>
      </main>

     
      <section id="cards" className="py-5" style={{ backgroundColor: "#F0E5CF" }}>
        <div className="container">
          <Cards />
        </div>
      </section>

      
      <section className="py-5">
        <div id="projectCarousel" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img src="/Restaurante.jpg" className="d-block w-100" alt="Restaurante" style={{ height: "400px", objectFit: "cover" }} />
            </div>
            <div className="carousel-item">
              <img src="/ingredientes.jpg" className="d-block w-100" alt="Ingredientes" style={{ height: "400px", objectFit: "cover" }} />
            </div>
            <div className="carousel-item">
              <img src="/img3.jpg" className="d-block w-100" alt="Cocina profesional" style={{ height: "400px", objectFit: "cover" }} />
            </div>
          </div>

          
          <button className="carousel-control-prev" type="button" data-bs-target="#projectCarousel" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Anterior</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#projectCarousel" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Siguiente</span>
          </button>
        </div>
      </section>

     
      <section className="py-5 text-center text-dark" style={{ backgroundColor: "#F0E5CF" }}>
        <div className="container">
          <h2 className="fw-bold mb-3" style={{ color: "#4B6587" }}>Únete a nosotros</h2>
          <p className="mb-4 fs-5">
            Comienza hoy a gestionar tu negocio con eficiencia y control total de tus costes.
          </p>
          <a href="/register" className="btn btn-lg" style={{ backgroundColor: "#F9C784", color: "#4B6587", fontWeight: "bold" }}>
            Registrarme ahora
          </a>
        </div>
      </section>
    </div>
  );
};
