import React from "react";

export const Cards = () => {
  const data = [
    {
      title: "Escandallos automáticos",
      text: "Crea escandallos precisos para cada plato y conoce el coste real de tus recetas.",
      icon: "bi bi-calculator",
    },
    {
      title: "Control de ingredientes",
      text: "Gestiona tu inventario y mantén un seguimiento exacto de tus insumos y proveedores.",
      icon: "bi bi-box-seam",
    },
    {
      title: "Análisis de rentabilidad",
      text: "Visualiza los márgenes de beneficio y optimiza los precios de tus menús.",
      icon: "bi bi-graph-up-arrow",
    },
    {
      title: "Gestión para restaurantes",
      text: "Controla el coste de los alimentos de tu restaurante con precisión profesional.",
      icon: "bi bi-shop",
    },
  ];

  return (
    <div className="row g-4">
      {data.map((card, index) => (
        <div className="col-md-6 col-lg-3" key={index}>
          <div className="card h-100 shadow-sm border-0" style={{ borderRadius: "15px" }}>
            <div className="card-body text-center">
              <i className={`${card.icon} fs-1 mb-3`} style={{ color: "#4B6587" }}></i>
              <h5 className="card-title fw-bold" style={{ color: "#4B6587" }}>
                {card.title}
              </h5>
              <p className="card-text text-muted">{card.text}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};