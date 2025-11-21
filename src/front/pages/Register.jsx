import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export const Register = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_BACKEND_URL;

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

      if (!res.ok) {
        throw new Error(data.error || data.msg || "Error al registrarse");
      }

      // Registro correcto → ir a login
      navigate("/login");
    } catch (err) {
      setError(err.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        backgroundImage: 'url("/Restaurante.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="col-12 col-md-6 col-lg-4">
        <div className="card shadow-sm border-0">
          <div
            className="card-header text-white text-center"
            style={{ backgroundColor: "rgb(75, 101, 135)" }}
          >
            <h1 className="h4 mb-0">REGISTRO</h1>
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
            {error && (
              <div className="alert alert-danger py-2" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} noValidate>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Nombre
                </label>
                <input
                  id="name"
                  type="text"
                  className="form-control"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

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
                <label htmlFor="telefono" className="form-label">
                  Teléfono
                </label>
                <input
                  id="telefono"
                  type="tel"
                  className="form-control"
                  placeholder="Teléfono (opcional)"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="direccion" className="form-label">
                  Dirección
                </label>
                <input
                  id="direccion"
                  type="text"
                  className="form-control"
                  placeholder="Dirección (opcional)"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
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

              <div className="mb-3">
                <label htmlFor="repeat" className="form-label">
                  Repetir password
                </label>
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
                style={{ backgroundColor: "rgb(59, 74, 99)" }}
                disabled={loading}
              >
                {loading ? "Creando..." : "REGISTRAR"}
              </button>
            </form>

            <div className="text-center">
              <span className="text-muted me-1">¿Ya tienes cuenta?</span>
              <Link to="/login" className="text-decoration-none">
                Inicia sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;