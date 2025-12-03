import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "";
const NAV_COLOR = "#325fad";

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== repeatPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const registerURL = new URL("api/user/register", API_BASE).toString();
      const res = await fetch(registerURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password.trim(),
          name: name.trim(),
          telefono: telefono.trim(),
          direccion: direccion.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.msg || "Error al registrarse");

      setName("");
      setTelefono("");
      setDireccion("");
      setEmail("");
      setPassword("");
      setRepeatPassword("");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container-fluid d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", backgroundColor: "#f5f7fb" }}
    >
      <div className="col-12 col-md-6 col-lg-4">
        <div
          className="card shadow-sm border-0"
          style={{ background: "rgba(255, 255, 255, 0.95)", borderRadius: "15px", overflow: "hidden" }}
        >
          <div
            className="card-header text-white d-flex justify-content-between align-items-center"
            style={{ backgroundColor: NAV_COLOR }}
          >
            <h1 className="h5 mb-0">Crea tu cuenta</h1>
            <button
              type="button"
              className="btn btn-sm btn-light"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>

          <div className="card-body">
            {error && (
              <div className="alert alert-danger py-2" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} noValidate>
              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Teléfono</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Teléfono (opcional)"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Dirección</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Dirección (opcional)"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Repetir password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="********"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn w-100 text-white"
                style={{ backgroundColor: NAV_COLOR, borderColor: NAV_COLOR }}
                disabled={loading}
              >
                {loading ? "Creando..." : "REGISTRAR"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
