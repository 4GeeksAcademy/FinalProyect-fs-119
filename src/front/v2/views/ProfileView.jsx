// src/front/v2/views/ProfileView.jsx
import React from "react";
import { formatNumber } from "../utils/formatters";

// Avatar helper (copiado del antiguo Profile / MasterCard)
function getAvatarFromText(text) {
  if (!text || !text.trim()) {
    return "https://avatar.iran.liara.run/public/boy";
  }
  return `https://avatar.iran.liara.run/username?username=${encodeURIComponent(
    text.trim()
  )}`;
}

export default function ProfileView({
  profileName,
  email,
  telefono,
  direccion,
  isEditingProfile,
  profileLoading,
  profileMsg,
  profileError,
  showCreateRest,
  restForm,
  restLoading,
  restError,
  restaurants,
  onSubmitProfile,
  setProfileName,
  setEmail,
  setTelefono,
  setDireccion,
  setIsEditingProfile,
  setShowCreateRest,
  onChangeRestField,
  onSubmitCreateRest,
  openInMaps,
}) {
  // Lista “segura” de restaurantes (igual patrón que CategoryList / RestaurantView)
  const safeRestaurants = (restaurants || []).filter(
    (r) => r && (r.name || r.id)
  );

  return (
    <section className="mc-panel">
      <div className="mc-panel-head">
        <h3>Perfil</h3>
      </div>

      {/* === AVATAR GRANDE ARRIBA ========================== */}
      <div
        className="mc-profile-avatar-wrap"
        style={{
          marginBottom: "1.25rem",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div className="mc-profile-avatar mc-profile-avatar--large">
          <img
            src={getAvatarFromText(profileName || email || "User")}
            alt="Avatar"
          />
        </div>
      </div>
      {/* Mensajes de estado del perfil */}
      {profileError && <div className="mc-error mb-2">{profileError}</div>}
      {profileMsg && <div className="mc-success mb-2">{profileMsg}</div>}

      {profileLoading && !isEditingProfile && (
        <div className="mc-empty">Cargando perfil…</div>
      )}

      {/* === BLOQUE DE DATOS DE PERFIL (FORM / READONLY) === */}
      {isEditingProfile ? (
        <form
          className="mc-form"
          onSubmit={onSubmitProfile}
          style={{ maxWidth: 520, marginBottom: "2rem" }}
        >
          <h4 className="mc-form-title">Editar perfil</h4>

          <label className="mc-field">
            <span>Nombre</span>
            <input
              className="mc-input"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
            />
          </label>

          <label className="mc-field">
            <span>Correo</span>
            <input
              className="mc-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="mc-field">
            <span>Teléfono</span>
            <input
              className="mc-input"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </label>

          <label className="mc-field">
            <span>Dirección</span>
            <input
              className="mc-input"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />
          </label>

          <div className="mc-form-actions">
            <button
              type="button"
              className="mc-btn-secondary"
              onClick={() => setIsEditingProfile(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="mc-cta" disabled={profileLoading}>
              {profileLoading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      ) : (
        <div
          className="mc-profile-readonly"
          style={{
            maxWidth: 520,
            marginBottom: "2rem",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <div className="mc-field">
            <span className="mc-label">Nombre</span>
            <div className="mc-value">
              {profileName || <span className="mc-muted">-</span>}
            </div>
          </div>
          <div className="mc-field">
            <span className="mc-label">Correo</span>
            <div className="mc-value">
              {email || <span className="mc-muted">-</span>}
            </div>
          </div>
          <div className="mc-field">
            <span className="mc-label">Teléfono</span>
            <div className="mc-value">
              {telefono || <span className="mc-muted">-</span>}
            </div>
          </div>
          <div className="mc-field">
            <span className="mc-label">Dirección</span>
            <div className="mc-value">
              {direccion ? (
                <span className="mc-link" onClick={() => openInMaps(direccion)}>
                  {direccion}
                </span>
              ) : (
                <span className="mc-muted">-</span>
              )}
            </div>
          </div>

          <div className="mc-form-actions" style={{ marginTop: "0.75rem" }}>
            <button
              type="button"
              className="mc-cta"
              onClick={() => setIsEditingProfile(true)}
            >
              Editar perfil
            </button>
          </div>
        </div>
      )}

      {/* === SECCIÓN SEPARADA: RESTAURANTES DEL USUARIO === */}
      <div
        className="mc-panel-subhead"
        style={{ marginTop: "1.5rem", marginBottom: "0.75rem" }}
      >
        <h4>Restaurantes</h4>
        {!showCreateRest && (
          <button
            type="button"
            className="mc-cta mc-cta-small"
            onClick={() => setShowCreateRest(true)}
          >
            New restaurant
          </button>
        )}
        {showCreateRest && (
          <button
            type="button"
            className="mc-cta mc-cta-secondary mc-cta-small"
            onClick={() => setShowCreateRest(false)}
          >
            Cancel
          </button>
        )}
      </div>

      {restError && <div className="mc-error mb-2">{restError}</div>}

      {/* Form de creación de restaurante dentro del perfil */}
      {showCreateRest && (
        <form
          className="mc-form"
          onSubmit={onSubmitCreateRest}
          style={{ maxWidth: 480, marginBottom: "1.5rem" }}
        >
          <label className="mc-field">
            <span>Nombre del restaurante *</span>
            <input
              className="mc-input"
              value={restForm.name}
              onChange={(e) => onChangeRestField("name", e.target.value)}
              required
            />
          </label>

          <label className="mc-field">
            <span>Teléfono (opcional)</span>
            <input
              className="mc-input"
              value={restForm.telefono}
              onChange={(e) => onChangeRestField("telefono", e.target.value)}
            />
          </label>

          <label className="mc-field">
            <span>Dirección (opcional)</span>
            <input
              className="mc-input"
              value={restForm.direccion}
              onChange={(e) => onChangeRestField("direccion", e.target.value)}
            />
          </label>

          <div className="mc-form-actions">
            <button type="submit" className="mc-cta" disabled={restLoading}>
              {restLoading ? "Creando..." : "Crear y abrir en dashboard"}
            </button>
          </div>
        </form>
      )}

      {/* Listado de restaurantes con estilo CategoryView / CategoryList */}
      {!showCreateRest && (
        <>
          {profileLoading && !safeRestaurants.length && (
            <div className="mc-empty">Cargando…</div>
          )}

          {!profileLoading && !safeRestaurants.length && (
            <div className="mc-empty">Aún no has creado restaurantes.</div>
          )}

          {safeRestaurants.length > 0 && (
            <div className="mc-cards" style={{ marginTop: "0.5rem" }}>
              {safeRestaurants.map((r) => (
                <div key={r.id} className="mc-card mc-card--category">
                  <div className="mc-card-avatar">
                    {(r.name || "R")[0].toUpperCase()}
                  </div>

                  <div className="mc-card-body">
                    <div className="mc-card-title">
                      {r.name || `Restaurant #${r.id}`}
                    </div>

                    {r.telefono && (
                      <div className="mc-card-sub mc-card-sub--muted">
                        Teléfono: {r.telefono}
                      </div>
                    )}

                    {r.direccion && (
                      <div className="mc-card-sub">
                        <span
                          className="mc-link"
                          onClick={() => openInMaps(r.direccion)}
                        >
                          {r.direccion}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
