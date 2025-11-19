import React from "react";

export function Profile() {
  return (
    <div className="container my-4">
      <div className="card border-0 shadow-sm">
        <div className="card-header text-white text-uppercase fs-3 fw-semibold text-center"
        style={{ backgroundColor: "rgb(75, 101, 135)" }}>
          PERFIL DE USUARIO
        </div>

        <div className="card-body">
          <div className="d-flex justify-content-center mb-4">
            <div
              className="rounded-circle border border-2 border-secondary-subtle bg-light d-flex align-items-center justify-content-center"
              style={{
                width: "160px",
                height: "160px",
                overflow: "hidden",
              }}
            >
              <img
                src="" 
                alt="Logo del usuario"
                className="img-fluid rounded-circle"
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
            </div>
          </div>

          <form>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: Dano Olivera"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">CIF</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: B12345678"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Correo</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="@email.com"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="********"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Teléfono</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="666 123 456"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Dirección</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Calle Ejemplo 123"
                />
              </div>
            </div>

            <div className="mt-4 text-end">
              <button
                type="submit"
                className="btn text-white px-4"
                style={{ backgroundColor: "rgb(59, 74, 99)" }}
              >
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
