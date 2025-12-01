// src/front/pages/LandingPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Cards } from "../components/Cards";

const LandingPage = () => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-white">
      {/* HERO PRINCIPAL */}
      <main
        className="flex-grow-1 d-flex align-items-center"
        style={{ backgroundColor: "#F9FBFF" }}
      >
        {/* Usamos container-fluid para que la imagen pueda llegar al borde derecho */}
        <div className="container-fluid py-5">
          <div className="row align-items-center gx-0">
            {/* Columna izquierda: texto + botones */}
            <div className="col-12 col-lg-6 px-4 px-lg-5 mb-4 mb-lg-0">
              <h1
                className="fw-bold mb-3"
                style={{ fontSize: "2.6rem", color: "#1f2937" }}
              >
                Calcula el coste de tus platos sin hojas de cálculo
              </h1>
              <p
                className="fs-5 mb-4"
                style={{ maxWidth: "480px", color: "#4b5563" }}
              >
                Organiza rápida y fácilmente el coste de tus recetas.
              </p>

              <div className="d-flex flex-wrap align-items-center gap-3">
                <Link
                  to="/register"
                  className="btn btn-primary btn-lg px-4"
                  style={{ borderRadius: "999px" }}
                >
                  Empezar
                </Link>
                <Link
                  to="/login"
                  className="btn btn-outline-primary btn-lg px-4"
                  style={{ borderRadius: "999px" }}
                >
                  Iniciar sesión
                </Link>
              </div>
            </div>

            {/* Columna derecha: imagen "a sangre" hacia la derecha y abajo */}
            <div className="col-12 col-lg-6 d-flex justify-content-end">
              <div
                className="w-100"
                style={{
                  minHeight: "320px",
                  height: "100%",
                }}
              >
                <img
                  src="/LandinFoto.png"
                  alt="Vista de resumen de costes de platos"
                  className="img-fluid"
                  style={{
                    width: "100vw",        // se extiende hasta el borde del viewport
                    maxWidth: "100%",      // no rompe en móvil
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 0,
                    boxShadow: "none",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* SECCIÓN CARDS / FEATURES */}
      <section
        id="cards"
        className="py-5"
        style={{ backgroundColor: "#ffffff", borderTop: "1px solid #e5e7eb" }}
      >
        <div className="container">
          <Cards />
        </div>
      </section>

      {/* CTA FINAL */}
      <section
        className="py-5 text-center text-dark"
        style={{ backgroundColor: "#F3F4F6", borderTop: "1px solid #e5e7eb" }}
      >
        <div className="container">
          <h2 className="fw-bold mb-3" style={{ color: "#111827" }}>
            Únete a set a meal
          </h2>
          <p className="mb-4 fs-5" style={{ color: "#4b5563" }}>
            Empieza hoy a gestionar tu negocio con eficiencia y control total de
            tus costes.
          </p>
          <Link
            to="/register"
            className="btn btn-primary btn-lg px-4"
            style={{ borderRadius: "999px" }}
          >
            Registrarme ahora
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
