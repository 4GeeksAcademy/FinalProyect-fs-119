import React, { useEffect, useState } from "react";

export const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("")
      .then((res) => res.json())
      .then((data) => {
        setRestaurants(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center mt-5">Cargando restaurantes...</div>;

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4"> Restaurantes</h2>
      <div className="row">
        {restaurants.map((r) => (
          <div key={r.id} className="col-md-4 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-body text-center">
                <h5 className="card-title">{r.name}</h5>
                <p className="card-text"><strong>Teléfono:</strong> {r.telefono}</p>
                <p className="card-text"><strong>Dirección:</strong> {r.direccion}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};