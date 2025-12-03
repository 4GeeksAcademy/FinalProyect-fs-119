import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ModalResetPassword from "../components/ModalResetPassword";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "";
const NAV_COLOR = "#325fad";

const decodeJwtPayload = (tkn) => {
  try {
    const base64 = tkn.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModalReset, setShowModalReset] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
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
      if (!res.ok) throw new Error(data.error || data.msg || "Error al iniciar sesión");

      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      let userId = data?.user?.id || data?.user?._id || null;
      if (!userId && data?.token) {
        const payload = decodeJwtPayload(data.token);
        userId = payload?.id || payload?.user_id || payload?.sub || null;
      }
      if (!userId) throw new Error("No se pudo determinar el user_id tras el login.");

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
            <h1 className="h5 mb-0">Inicia sesión</h1>
            <button
              type="button"
              className="btn btn-sm btn-light"
              onClick={() => navigate("/register")}
            >
              Registro
            </button>
          </div>

          <div className="card-body">
            {error && (
              <div className="alert alert-danger py-2" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} noValidate>
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

              <button
                type="submit"
                className="btn w-100 text-white"
                style={{ backgroundColor: NAV_COLOR, borderColor: NAV_COLOR }}
                disabled={loading}
              >
                {loading ? "Entrando..." : "LOGIN"}
              </button>

              <div className="text-center mb-2 mt-3">
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none"
                  onClick={() => setShowModalReset(true)}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </form>
          </div>
        </div>

        <ModalResetPassword
          show={showModalReset}
          onClose={() => setShowModalReset(false)}
        />
      </div>
    </div>
  );
};

export default Login;