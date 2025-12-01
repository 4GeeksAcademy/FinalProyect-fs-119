import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ backgroundColor: "#f5f7fb" }}
    >
      <main className="flex-grow-1 d-flex align-items-center">
        <div className="container py-5">
          <div className="row align-items-center">

            <div className="col-lg-6 mb-4 mb-lg-0">
              <h1
                className="fw-bold mb-3"
                style={{ fontSize: "3rem", color: "#1a2b4b" }}
              >
                Calcula el coste de tus platos
                <br />
                sin usar hojas de cálculo
              </h1>

              <p className="fs-5 mb-4" style={{ color: "#4b4f5c" }}>
                Gestiona rápida y fácilmente el coste de tus recetas y mantén
                el control total de los márgenes de tu restaurante.
              </p>

              <div className="d-flex flex-wrap gap-3">
                <button
                  className="btn btn-lg text-white"
                  style={{ backgroundColor: "#325fad", borderColor: "#325fad" }}
                  onClick={() => navigate("/logister?mode=register")}
                >
                  Comenzar
                </button>

                <button
                  className="btn btn-lg btn-outline-primary"
                  style={{ borderColor: "#325fad", color: "#325fad" }}
                  onClick={() => navigate("/logister?mode=login")}
                >
                  Iniciar sesión
                </button>
              </div>
            </div>

            <div className="col-lg-6">
              <div
                className="shadow-sm rounded-3 bg-white p-3"
                style={{ border: "1px solid #e1e4f0" }}
              >
                <img
                  src="/logooo.png"
                  alt="Vista previa de la aplicación"
                  className="img-fluid rounded-3"
                />
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
