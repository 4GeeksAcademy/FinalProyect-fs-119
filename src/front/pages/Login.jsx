import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_BACKEND_URL;

  const decodeJwtPayload = (tkn) => {
    try {
      const base64 = tkn.split(".")[1];
      const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(json);
    } catch {
      return null;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!API_BASE) throw new Error("Falta VITE_BACKEND_URL en .env");

      const loginURL = new URL("api/user/login", API_BASE).toString();

      const res = await fetch(loginURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.msg || "Error al iniciar sesión");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      let userId = data?.user?.id || data?.user?._id || null;

      if (!userId && data?.token) {
        const payload = decodeJwtPayload(data.token);
        userId = payload?.id || payload?.user_id || payload?.sub || null;
      }

      if (!userId) {
        throw new Error("No se pudo determinar el user_id tras el login.");
      }

      localStorage.setItem("user_id", String(userId));
      navigate("/home");
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container-fluid d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        backgroundImage: 'url("/mesa.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="col-12 col-md-6 col-lg-4">
        <div
          className="card shadow-sm border-0"
          style={{
            background: "rgba(255, 255, 255, 0.20)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            borderRadius: "15px",
            overflow: "hidden",
          }}
        >
          <div
            className="card-header text-white text-center"
            style={{
              backgroundColor: "rgba(75, 101, 135, 0.85)",
            }}
          >
            <h1 className="h4 mb-0">LOGIN</h1>
          </div>

          <div
            className="card-body"
            style={{
              background: "transparent",
            }}
          >
            {error && (
              <div className="alert alert-danger py-2" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} noValidate>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
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
                <label htmlFor="password" className="form-label">
                  Password
                </label>
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

              <button
                type="submit"
                className="btn w-100 text-white"
                style={{ backgroundColor: "rgb(59, 74, 99)" }}
                disabled={loading}
              >
                {loading ? "Entrando..." : "LOGIN"}
              </button>
            </form>

            <div className="text-center mb-2 mt-3">
              <Link to="/reset-password" className="text-decoration-none">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <div className="text-center mt-2">
              <span className="text-muted me-1">¿No tienes cuenta?</span>
              <Link to="/register">Regístrate</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
