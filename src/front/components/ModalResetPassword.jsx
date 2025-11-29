import React, { useState } from "react";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const ModalResetPassword = ({ show, onClose }) => {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  if (!show) return null; // No renderiza si no está abierto

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/user/resetPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Error enviando email");

      setMsg("Si el correo existe, se ha enviado un enlace para restablecer la contraseña.");
      setEmail("");

    } catch (err) {
      setError(err.message);
    }
  };

  return (

  <>
    {/* Contenedor principal del modal */}
    <div
      className="modal fade show"
      style={{
        display: "block",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1055,
        overflowY: "auto",
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        
        <div className="modal-content">

          <div className="modal-header">
            <h5 className="modal-title">Restablecer contraseña</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <label>Email:</label>
              <input
                type="email"
                className="form-control mb-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <button type="submit" className="btn btn-primary w-100">
                Enviar enlace de recuperación
              </button>
            </form>

            {msg && <div className="alert alert-success mt-3">{msg}</div>}
            {error && <div className="alert alert-danger mt-3">{error}</div>}
          </div>

        </div>
      </div>
    </div>

    {/* Backdrop */}
    <div
      className="modal-backdrop fade show"
      style={{ zIndex: 1050 }}
      onClick={onClose}
    ></div>
  </>
);

};

export default ModalResetPassword;