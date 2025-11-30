import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./auth.css";

// 👇 Reutilizamos el modal antiguo (el que ya te funciona con tu backend)
import ModalResetPassword from "../../components/ModalResetPassword";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 👇 nuevo: modal reset
  const [showModalReset, setShowModalReset] = useState(false);

  const onChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api.login(formData);

      // acepta ambos: access_token o token (según tu backend)
      const token = data?.access_token || data?.token;
      if (!token) throw new Error("El backend no devolvió token.");

      localStorage.setItem("token", token);

      // MVP: tras login, entra a /app (dashboard)
      navigate("/app", { replace: true });
    } catch (err) {
      setError(err.message || "Error de login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-icon">🍽️</div>
          <div>
            <h1>Entrar</h1>
            <p>Accede a tu panel</p>
          </div>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={onChange}
              placeholder="tu@email.com"
            />
          </label>

          <label>
            Contraseña
            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={onChange}
              placeholder="••••••••"
            />
          </label>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {/* 👇 nuevo: link a modal reset (sin tocar el estilo general del v2) */}
        <div className="auth-links" style={{ marginTop: 10 }}>
          <button
            type="button"
            className="auth-link-btn"
            onClick={() => setShowModalReset(true)}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <div className="auth-links">
          <span>¿No tienes cuenta?</span> <Link to="/register">Crear cuenta</Link>
        </div>

        <div className="auth-links" style={{ marginTop: 10 }}>
          <Link to="/">← Volver a inicio</Link>
        </div>

        {/* 👇 nuevo: montamos el modal antiguo */}
        <ModalResetPassword
          show={showModalReset}
          onClose={() => setShowModalReset(false)}
        />
      </div>
    </div>
  );
}
