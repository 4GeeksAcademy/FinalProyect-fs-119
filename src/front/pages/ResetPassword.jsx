import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";


const API_URL = import.meta.env.VITE_BACKEND_URL;

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        document.title = "Nueva contraseña - Set a Meal";
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (password !== password2) {
            setError("Las contraseñas no coinciden");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/user/resetPassword/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || "Error al cambiar la contraseña");

            setMessage("Contraseña actualizada correctamente. Ahora puedes iniciar sesión.");
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (err) {
            setError(err.message);
        }
    };



  return (

 <div className="container mt-5">
      <h2>Establecer nueva contraseña</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Nueva contraseña</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password2" className="form-label">Repite la contraseña</label>
          <input
            type="password"
            className="form-control"
            id="password2"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Guardar contraseña</button>
      </form>
      {message && <div className="alert alert-success mt-3">{message}</div>}
      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </div>
  );
};

export default ResetPassword;