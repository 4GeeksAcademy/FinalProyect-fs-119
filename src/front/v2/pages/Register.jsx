// src/front/v2/pages/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./auth.css";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      name: (formData.name || "").trim(),
      email: (formData.email || "").trim(),
      password: formData.password || "",
    };

    if (!payload.name || !payload.email || !payload.password) {
      setError("Nombre, email y contraseña son obligatorios.");
      return;
    }

    setLoading(true);
    try {
      // 👇 aquí usamos el endpoint de registro de tu wrapper v2
      await api.register(payload);

      // MVP: tras registrarse, lo llevamos al login
      navigate("/login", { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al crear la cuenta");
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
            <h1>Crear cuenta</h1>
            <p>Empieza a usar tu panel</p>
          </div>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Nombre
            <input
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={onChange}
              placeholder="Tu nombre"
            />
          </label>

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
            {loading ? "Creando..." : "Crear cuenta"}
          </button>
        </form>

        <div className="auth-links">
          <span>¿Ya tienes cuenta?</span>{" "}
          <Link to="/login">Entrar</Link>
        </div>

        <div className="auth-links" style={{ marginTop: 10 }}>
          <Link to="/">← Volver a inicio</Link>
        </div>
      </div>
    </div>
  );
}
