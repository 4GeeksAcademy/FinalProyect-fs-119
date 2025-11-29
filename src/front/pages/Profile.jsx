// src/front/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar.jsx";
import useGlobalReducer from "../hooks/useGlobalReducer";

const API = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

function getAvatarFromText(text) {
  if (!text || !text.trim()) return "https://avatar.iran.liara.run/public/boy";
  return `https://avatar.iran.liara.run/username?username=${encodeURIComponent(text.trim())}`;
}

const Profile = () => {
  const { store, dispatch } = useGlobalReducer();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  const [profileName, setProfileName] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const restaurantsFromStore = store?.restaurants || [];
  const [restaurants, setRestaurants] = useState(restaurantsFromStore);

  useEffect(() => {
    setRestaurants(restaurantsFromStore);
  }, [restaurantsFromStore]);

  useEffect(() => {
    if (!userId || !token) return;
    const controller = new AbortController();
    const loadProfile = async () => {
      setError("");
      try {
        setLoading(true);
        const res = await fetch(`${API}/api/user/profile/${userId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.msg || "Error");
        const u = data.user || data.usuario || data;
        setProfileName(u?.name || "");
        setEmail(u?.email || "");
        setTelefono(u?.telefono || "");
        setDireccion(u?.direccion || "");
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
    return () => controller.abort();
  }, [userId, token]);

  useEffect(() => {
    if (!userId || restaurantsFromStore.length) return;
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/api/user/${userId}/restaurant`, {
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || "Error");
        setRestaurants(Array.isArray(data.restaurants) ? data.restaurants : []);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [userId, token, restaurantsFromStore]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!userId || !token) return;
    setMsg("");
    setError("");
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/user/update/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: profileName.trim(),
          email: email.trim(),
          telefono: telefono.trim() || null,
          direccion: direccion.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.msg || "Error");
      setMsg(data.msg || "Perfil actualizado");
      setIsEditing(false);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar onOpenRestaurantModal={() => dispatch({ type: "ui_set", payload: { showRestaurantModal: true } })} />

      <main className="flex-grow-1 p-4" style={{ background: "#F7F9FB" }}>
        <div className="container">
          <h2 style={{ color: "#21334a", marginBottom: 18 }}>Perfil</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {msg && <div className="alert alert-success">{msg}</div>}

          <div className="row">
            <div className="col-lg-6 mb-4">
              <div className="card shadow-sm border-0">
                <div className="card-header text-white text-uppercase fs-5 fw-semibold text-center" style={{ backgroundColor: "rgb(75, 101, 135)" }}>
                  Información de usuario
                </div>

                <div className="card-body">
                  <div className="d-flex justify-content-center mb-4">
                    <div className="rounded-circle border border-2 border-secondary-subtle bg-light d-flex align-items-center justify-content-center" style={{ width: 160, height: 160, overflow: "hidden" }}>
                      <img src={getAvatarFromText(profileName)} alt="Avatar" className="img-fluid rounded-circle" style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                    </div>
                  </div>

                  {isEditing ? (
                    <form onSubmit={handleProfileSubmit}>
                      <div className="mb-3">
                        <label className="form-label">Nombre</label>
                        <input className="form-control" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Correo</label>
                        <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Teléfono</label>
                        <input className="form-control" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Dirección</label>
                        <input className="form-control" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
                      </div>

                      <div className="text-end">
                        <button type="button" className="btn btn-outline-secondary me-2" onClick={() => setIsEditing(false)}>
                          Cancelar
                        </button>
                        <button type="submit" className="btn text-white" style={{ backgroundColor: "rgb(59, 74, 99)" }} disabled={loading}>
                          {loading ? "Guardando..." : "Guardar cambios"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="mb-2"><strong>Nombre:</strong> <div className="form-control-plaintext">{profileName || "-"}</div></div>
                      <div className="mb-2"><strong>Correo:</strong> <div className="form-control-plaintext">{email || "-"}</div></div>
                      <div className="mb-2"><strong>Teléfono:</strong> <div className="form-control-plaintext">{telefono || "-"}</div></div>
                      <div className="mb-2"><strong>Dirección:</strong> <div className="form-control-plaintext">{direccion || "-"}</div></div>

                      <div className="text-end mt-3">
                        <button className="btn text-white" style={{ backgroundColor: "rgb(59, 74, 99)" }} onClick={() => setIsEditing(true)} disabled={!token}>
                          Editar perfil
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-6 mb-4">
              <div className="card shadow-sm border-0">
                <div className="card-header text-white text-uppercase fs-5 fw-semibold text-center" style={{ backgroundColor: "rgb(75, 101, 135)" }}>
                  Restaurantes
                </div>

                <div className="card-body">
                  {loading && <p className="text-muted">Cargando...</p>}
                  {!loading && restaurants.length === 0 && <p className="text-muted mb-0">Aún no has creado restaurantes.</p>}

                  {!loading && restaurants.length > 0 && (
                    <ul className="list-group list-group-flush">
                      {restaurants.map((r) => (
                        <li key={r.id || r._id} className="list-group-item d-flex align-items-center">
                          <div className="me-3">
                            <div className="rounded-circle border border-1 border-secondary-subtle bg-light d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, overflow: "hidden" }}>
                              <img src={getAvatarFromText(r.name)} alt={r.name} className="img-fluid" style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                            </div>
                          </div>
                          <div style={{ maxWidth: "70%" }}>
                            <div className="fw-semibold">{r.name}</div>
                            {r.telefono && <div className="small text-muted">Teléfono: {r.telefono}</div>}
                            {r.direccion && <div className="small">{r.direccion}</div>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
