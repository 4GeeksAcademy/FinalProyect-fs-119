import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateRestaurantForm() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = import.meta.env.VITE_BACKEND_URL;
  
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
////
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);
////
  const fetchRestaurants = async () => {
    try {
      setError("");
      const res = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.msg || "No se pudo cargar la lista");
      setList(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (token) fetchRestaurants();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const payload = {
      name: name.trim(),
      direccion: direccion.trim() || null,
      telefono: telefono.trim() || null,
    };

    if (!payload.name) {
      setError("El nombre es obligatorio.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.msg || "No se pudo crear el restaurante");

      setSuccess("Restaurante creado correctamente.");
      setName("");
      setDireccion("");
      setTelefono("");
      setList((prev) => [data, ...prev]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-start py-5" style={{ minHeight: "100vh" }}>
      <div className="col-12 col-md-8 col-lg-6">
        <div className="card shadow-sm border-0">
          <div className="card-header text-white text-center" style={{ backgroundColor: "rgb(59, 74, 99)" }}>
            <h1 className="h4 mb-0">CREAR RESTAURANTE</h1>
          </div>

          <div
            className="card-body"
            style={{
              backgroundImage: 'url("/fondo.jpg")',
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backdropFilter: "blur(6px)",
              borderRadius: "10px",
            }}
          >
            {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
            {success && <div className="alert alert-success py-2" role="alert">{success}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Nombre del restaurante *</label>
                <input
                  id="name"
                  type="text"
                  className="form-control"
                  placeholder="Ej: Casa Danonino"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="direccion" className="form-label">Dirección (opcional)</label>
                <input
                  id="direccion"
                  type="text"
                  className="form-control"
                  placeholder="Calle Ejemplo 123"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="telefono" className="form-label">Teléfono (opcional)</label>
                <input
                  id="telefono"
                  type="tel"
                  className="form-control"
                  placeholder="666 123 456"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn w-100 mb-3 text-white"
                style={{ backgroundColor: "rgb(59, 74, 99)" }}
                disabled={loading || !name.trim()}
              >
                {loading ? "Creando..." : "CREAR"}
              </button>
            </form>

            <hr className="my-4" />

            <h5 className="mb-3 text-center">Mis restaurantes</h5>
            {list.length === 0 ? (
              <p className="text-muted text-center mb-0">Aún no has creado restaurantes.</p>
            ) : (
              <ul className="list-group">
                {list.map((r) => (
                  <li key={r.id || r._id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div className="me-3 text-truncate" style={{ maxWidth: "70%" }}>
                      <div className="fw-semibold">{r.name}</div>
                      {r.direccion && <div className="small text-muted">{r.direccion}</div>}
                      {r.telefono && <div className="small text-muted">{r.telefono}</div>}
                    </div>
                    <span className={`badge ${r.is_active ? "bg-success" : "bg-secondary"}`}>
                      {r.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
