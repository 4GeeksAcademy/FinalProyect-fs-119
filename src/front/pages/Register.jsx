import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_BACKEND_URL || "https://cautious-fishstick-pj95gp4gw6grf9496-3001.app.github.dev";

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== repeatPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}api/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.msg || "Error al registrarse");
      }

      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="col-12 col-md-6 col-lg-4">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-dark text-white text-center">
            <h1 className="h4 mb-0">REGISTRO</h1>
          </div>
          <div className="card-body">
            {error && (
              <div className="alert alert-danger py-2" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} noValidate>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Name</label>
                <input
                  id="name"
                  type="name"
                  className="form-control"
                  placeholder="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  placeholder="@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="repeat" className="form-label">Repetir password</label>
                <input
                  id="repeat"
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
                className="btn btn-primary w-100 mb-3"
                disabled={loading}
              >
                {loading ? "Creando..." : "REGISTRAR"}
              </button>
            </form>

            <div className="text-center">
              <span className="text-muted me-1">¿Ya tienes cuenta?</span>
              <Link to="/login" className="text-decoration-none">Inicia sesión</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
