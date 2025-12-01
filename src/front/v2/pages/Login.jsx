// src/front/v2/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./auth.css";

// 👇 Reutilizamos el modal antiguo (el que ya te funciona con tu backend)
import ModalResetPassword from "../../components/ModalResetPassword";

// Helper para decodificar payload del JWT (sin verificar firma, solo lectura)
function decodeJwtPayload(token) {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch (e) {
    console.error("No se pudo decodificar el JWT:", e);
    return null;
  }
}

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

      // 🧹 Primero limpiamos el estado previo del otro usuario
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");

      // Guardamos el token nuevo
      localStorage.setItem("token", token);

      // Intentamos obtener el user_id de la respuesta del backend
      let userId =
        data?.user?.id ||
        data?.usuario?.id ||
        data?.user_id ||
        data?.id ||
        null;

      // Si no viene en el JSON, lo intentamos sacar del JWT
      if (!userId) {
        const payload = decodeJwtPayload(token);
        if (payload) {
          userId =
            payload.user_id ||
            payload.id ||
            payload.sub || // muchos backends usan "sub" para el ID
            null;
        }
      }

      if (!userId) {
        // No rompemos login, pero dejamos trazado el problema
        console.warn(
          "Login correcto pero no se pudo determinar user_id. Revisa el payload del token o la respuesta del backend."
        );
      } else {
        localStorage.setItem("user_id", String(userId));
      }

      // MVP: tras login, entra a /app (dashboard)
      navigate("/app", { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message || "Error de login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <div>
            <img
              src="/logoMauri.svg"
              alt="setameal logo"
              style={{
                height: "48px",
                width: "48px",
                display: "block",
                objectFit: "contain",
              }}
            />
          </div>
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
