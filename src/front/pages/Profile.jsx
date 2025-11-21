import React, { useEffect, useState } from "react";

export function Profile() {
  function getAvatarFromText(text) {
    if (!text || !text.trim()) return "https://avatar.iran.liara.run/public/boy";
    return `https://avatar.iran.liara.run/username?username=${encodeURIComponent(
      text.trim()
    )}`;
  }

  const [profileName, setProfileName] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [restaurants, setRestaurants] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [errorRestaurants, setErrorRestaurants] = useState("");

  const API_BASE = import.meta.env.VITE_BACKEND_URL;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  const PROFILE_URL = userId ? new URL(`/api/user/profile/${userId}`, API_BASE).toString() : null;
  const UPDATE_URL = userId ? new URL(`/api/user/update/${userId}`, API_BASE).toString() : null;
  const RESTAURANTS_URL = userId ? new URL(`/api/user/${userId}/restaurant`, API_BASE).toString() : null;

  useEffect(() => {
    const controller = new AbortController();
    const fetchProfile = async () => {
      if (!PROFILE_URL || !token) return;
      try {
        setProfileError("");
        const res = await fetch(PROFILE_URL, {
          method: "GET",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.msg || "No se pudo cargar el perfil");
        const u = data.user || data.usuario || data;
        if (u.name) setProfileName(u.name);
        if (u.email) setEmail(u.email);
        if (u.telefono) setTelefono(u.telefono);
        if (u.direccion) setDireccion(u.direccion);
      } catch (err) {
        if (err.name !== "AbortError") setProfileError(err.message);
      }
    };

    if (token && userId) fetchProfile();
    return () => controller.abort();
  }, [token, userId, PROFILE_URL]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!UPDATE_URL || !token) return;

    setProfileError("");
    setProfileMsg("");

    const payload = {
      email: email.trim(),
      name: profileName.trim(),
      telefono: telefono.trim() || null,
      direccion: direccion.trim() || null,
    };

    try {
      const res = await fetch(UPDATE_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.msg || "No se pudo actualizar el perfil");
      setProfileMsg(data.msg || "Perfil actualizado correctamente.");
      setIsEditing(false);
    } catch (err) {
      setProfileError(err.message);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const fetchRestaurants = async () => {
      if (!RESTAURANTS_URL) return;
      try {
        setErrorRestaurants("");
        setLoadingRestaurants(true);
        const res = await fetch(RESTAURANTS_URL, {
          method: "GET",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.msg || "No se pudo cargar la lista");
        setRestaurants(Array.isArray(data.restaurants) ? data.restaurants : []);
      } catch (err) {
        if (err.name !== "AbortError") setErrorRestaurants(err.message);
      } finally {
        setLoadingRestaurants(false);
      }
    };

    if (token && userId) fetchRestaurants();
    return () => controller.abort();
  }, [token, userId, RESTAURANTS_URL]);

  return (
    <div className="container my-4">
      <div className="card border-0 shadow-sm mb-4">
        <div
          className="card-header text-white text-uppercase fs-3 fw-semibold text-center"
          style={{ backgroundColor: "rgb(75, 101, 135)" }}
        >
          PERFIL
        </div>

        <div className="card-body">
          {profileError && <div className="alert alert-danger py-2 mb-3">{profileError}</div>}
          {profileMsg && <div className="alert alert-success py-2 mb-3">{profileMsg}</div>}

          <div className="d-flex justify-content-center mb-4">
            <div
              className="rounded-circle border border-2 border-secondary-subtle bg-light d-flex align-items-center justify-content-center"
              style={{ width: "160px", height: "160px", overflow: "hidden" }}
            >
              <img
                src={getAvatarFromText(profileName)}
                alt="Avatar del usuario"
                className="img-fluid rounded-circle"
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleProfileSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej: Dano Olivera"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Correo</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="666 123 456"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                  />
                </div>

                <div className="col-md-12">
                  <label className="form-label">Dirección</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Calle Ejemplo 123"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4 text-end">
                <button type="button" className="btn btn-outline-secondary me-2" onClick={() => setIsEditing(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn text-white px-4" style={{ backgroundColor: "rgb(59, 74, 99)" }} disabled={!token}>
                  Guardar cambios
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Nombre</label>
                  <p className="form-control-plaintext">{profileName || "-"}</p>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Correo</label>
                  <p className="form-control-plaintext">{email || "-"}</p>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Teléfono</label>
                  <p className="form-control-plaintext">{telefono || "-"}</p>
                </div>

                <div className="col-md-12">
                  <label className="form-label">Dirección</label>
                  <p className="form-control-plaintext">{direccion || "-"}</p>
                </div>
              </div>

              <div className="mt-4 text-end">
                <button
                  type="button"
                  className="btn text-white px-4"
                  style={{ backgroundColor: "rgb(59, 74, 99)" }}
                  onClick={() => setIsEditing(true)}
                  disabled={!token}
                >
                  Editar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div
          className="card-header text-white text-uppercase fs-3 fw-semibold text-center"
          style={{ backgroundColor: "rgb(75, 101, 135)" }}
        >
          RESTAURANTES
        </div>

        <div className="card-body">
          {loadingRestaurants ? (
            <p className="text-muted mb-0">Cargando restaurantes...</p>
          ) : errorRestaurants ? (
            <div className="alert alert-danger py-2">{errorRestaurants}</div>
          ) : restaurants.length === 0 ? (
            <p className="text-muted mb-0">Aún no has creado restaurantes.</p>
          ) : (
            <ul className="list-group list-group-flush">
              {restaurants.map((r) => (
                <li key={r.id || r._id} className="list-group-item d-flex align-items-center">
                  <div className="me-3">
                    <div className="rounded-circle border border-1 border-secondary-subtle bg-light d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px", overflow: "hidden" }}>
                      <img src={getAvatarFromText(r.name)} alt={r.name} className="img-fluid" style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                    </div>
                  </div>

                  <div className="me-3 text-truncate" style={{ maxWidth: "70%" }}>
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
  );
}

export default Profile;
