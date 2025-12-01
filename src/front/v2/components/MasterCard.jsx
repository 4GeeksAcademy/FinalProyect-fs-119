// src/front/v2/components/MasterCard.jsx
import React, { useState, useEffect } from "react";
import "./mastercard.css";
import { api } from "../services/api";
import { apiFetch } from "../services/apiClient";

import DashboardView from "../views/DashboardView";
import RestaurantsView from "../views/RestaurantsView";
import CategoryView from "../views/CategoryView";
import IngredientsView from "../views/IngredientsView";
import DishesView from "../views/DishesView";
import ProfileView from "../views/ProfileView";
import logoMauri2 from "/workspaces/FinalProyect-fs-119/public/logoMauri2.svg";

// Avatar helper reutilizado del viejo Profile
function getAvatarFromText(text) {
  if (!text || !text.trim()) return "https://avatar.iran.liara.run/public/boy";
  return `https://avatar.iran.liara.run/username?username=${encodeURIComponent(
    text.trim()
  )}`;
}

// Pequeño helper: abrir dirección en Google Maps sin usar APIs
function openInMaps(address) {
  if (!address) return;
  const url = `https://www.google.com/maps?q=${encodeURIComponent(address)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

const NAV = [
  { key: "dashboard", label: "Dashboard" },
  { key: "dishes", label: "Dishes" },
  { key: "ingredients", label: "Ingredients" },
  { key: "categories", label: "Categories" },
  { key: "restaurants", label: "Restaurant" },
  { key: "profile", label: "Profile" },
];

export default function MasterCard({ store, dispatch }) {
  // --- estado global / store ---
  const view = store.currentView || "restaurants";
  const restaurants = store.restaurants || [];
  const currentRestaurant = store.currentRestaurant;

  const dishes = store.dishes || [];
  const ingredients = currentRestaurant?.ingredients || [];
  const categories = currentRestaurant?.categories || [];

  const setView = (k) => dispatch({ type: "set_currentView", payload: k });

  const onSelectRestaurant = (rid) => {
    const r = restaurants.find((x) => String(x.id) === String(rid));
    if (!r) return;
    dispatch({ type: "set_currentRestaurant", payload: r });
    dispatch({ type: "set_currentView", payload: "dashboard" });
  };

  // ---------- ESTADO LOCAL PARA PROFILE / RESTAURANTES ----------
  const [profileName, setProfileName] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileError, setProfileError] = useState("");

  const [showCreateRest, setShowCreateRest] = useState(false);
  const [restForm, setRestForm] = useState({
    name: "",
    telefono: "",
    direccion: "",
  });
  const [restLoading, setRestLoading] = useState(false);
  const [restError, setRestError] = useState("");

  // --- NUEVO: estado para sidebar responsive ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleNavClick = (key) => {
    setView(key);
    setIsSidebarOpen(false); // en móvil, cerramos el panel al navegar
  };

  // Si salgo de profile/restaurants, cierro el form de restaurante
  useEffect(() => {
    if (view !== "profile" && view !== "restaurants") {
      setShowCreateRest(false);
      setRestError("");
    }
  }, [view]);

  // --- PROFILE: cargar datos de usuario ---
  useEffect(() => {
    if (typeof window === "undefined") return;
    const uid = localStorage.getItem("user_id");
    if (!uid) return;

    let ignore = false;

    (async () => {
      setProfileError("");
      setProfileMsg("");
      setProfileLoading(true);
      try {
        const data = await api.profile(uid);
        const u = data?.user || data?.usuario || data;
        if (!u || ignore) return;

        setProfileName(u.name || "");
        setEmail(u.email || "");
        setTelefono(u.telefono || "");
        setDireccion(u.direccion || "");
      } catch (err) {
        if (!ignore) {
          console.error(err);
          setProfileError(
            err.message || "No se pudo cargar la información de perfil"
          );
        }
      } finally {
        if (!ignore) setProfileLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  // --- PROFILE/RESTAURANTS: cargar restaurantes si aún no están en store ---
  useEffect(() => {
    if (typeof window === "undefined") return;
    const uid = localStorage.getItem("user_id");
    if (!uid) return;
    if (restaurants && restaurants.length) return;

    let ignore = false;
    (async () => {
      try {
        const data = await api.getRestaurants(uid);
        if (ignore) return;
        const list = Array.isArray(data?.restaurants)
          ? data.restaurants
          : Array.isArray(data)
          ? data
          : [];
        dispatch({ type: "set_restaurants", payload: list });
      } catch (err) {
        if (!ignore) console.error("Error cargando restaurantes:", err);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [restaurants?.length, dispatch]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (typeof window === "undefined") return;
    const uid = localStorage.getItem("user_id");
    if (!uid) return;

    setProfileMsg("");
    setProfileError("");

    // Normalizamos a string antes de hacer trim
    const safeName = profileName != null ? String(profileName) : "";
    const safeEmail = email != null ? String(email) : "";
    const safeTelefono = telefono != null ? String(telefono) : "";
    const safeDireccion = direccion != null ? String(direccion) : "";

    const payload = {
      name: safeName.trim(),
      email: safeEmail.trim(),
      telefono: safeTelefono.trim() || null,
      direccion: safeDireccion.trim() || null,
    };

    if (!payload.name || !payload.email) {
      setProfileError("Nombre y correo son obligatorios.");
      return;
    }

    try {
      setProfileLoading(true);
      const data = await apiFetch(`/api/user/update/${uid}`, {
        method: "PUT",
        body: payload,
      });
      setProfileMsg(data.msg || "Perfil actualizado");
      setIsEditingProfile(false);
    } catch (err) {
      console.error(err);
      setProfileError(err.message || "No se pudo actualizar el perfil");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleRestFormChange = (field, value) => {
    setRestForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateRestaurantFromProfile = async (e) => {
    e.preventDefault();
    if (typeof window === "undefined") return;
    const uid = localStorage.getItem("user_id");
    if (!uid) return;

    setRestError("");
    const payload = {
      name: restForm.name.trim(),
      telefono: restForm.telefono.trim() || null,
      direccion: restForm.direccion.trim() || null,
    };

    if (!payload.name) {
      setRestError("El nombre del restaurante es obligatorio.");
      return;
    }

    try {
      setRestLoading(true);
      const data = await api.createRestaurant(uid, payload);
      const created =
        data?.restaurant || data?.restaurante || data?.rest || data;

      if (created) {
        const updated = [...(store.restaurants || []), created];
        dispatch({ type: "set_restaurants", payload: updated });
        dispatch({ type: "set_currentRestaurant", payload: created });
        setShowCreateRest(false);
        setRestForm({ name: "", telefono: "", direccion: "" });
        setView("dashboard");
      }
    } catch (err) {
      console.error(err);
      setRestError(err.message || "No se pudo crear el restaurante");
    } finally {
      setRestLoading(false);
    }
  };

  return (
    <div className="mc-wrap">
      {/* SIDEBAR (responsive: overlay en móvil, fijo en desktop) */}
      <aside className={`mc-side ${isSidebarOpen ? "mc-side--open" : ""}`}>
        <div className="mc-brand">
          <div className="mc-logo">
            <img src={logoMauri2} alt="setameal logo" />
          </div>

          <div className="mc-brand-text">set a meal</div>
        </div>

        <nav className="mc-nav">
          {NAV.map((item) => (
            <button
              key={item.key}
              className={`mc-nav-item ${view === item.key ? "is-active" : ""}`}
              onClick={() => handleNavClick(item.key)}
              disabled={
                ["dashboard", "dishes", "ingredients", "categories"].includes(
                  item.key
                ) && !currentRestaurant?.id
              }
            >
              {/* Eliminamos el puntito .mc-dot para que no haya bullets */}
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* BACKDROP para móvil: tapa contenido cuando el menú está abierto */}
      <div
        className={`mc-side-backdrop ${
          isSidebarOpen ? "mc-side-backdrop--visible" : ""
        }`}
        onClick={handleCloseSidebar}
      />

      <section className="mc-main">
        <header className="mc-topbar">
          {/* Logo como “hamburguesa” en móvil */}
          <button
            type="button"
            className="mc-logo-toggle"
            onClick={handleToggleSidebar}
            aria-label="Open navigation"
          >
            <div className="mc-logo">
              <img src={logoMauri2} alt="setameal logo" />
            </div>
          </button>

          <div className="mc-topbar-left">
            <div className="mc-page-title">
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </div>
            <div className="mc-muted">
              {currentRestaurant?.name
                ? `Restaurant: ${currentRestaurant.name}`
                : "Select a restaurant to continue"}
            </div>
          </div>

          <div className="mc-topbar-right">
            <select
              className="mc-select"
              value={currentRestaurant?.id || ""}
              onChange={(e) => onSelectRestaurant(e.target.value)}
            >
              <option value="" disabled>
                {restaurants.length ? "Choose restaurant" : "No restaurants"}
              </option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name || `Restaurant #${r.id}`}
                </option>
              ))}
            </select>
          </div>
        </header>

        <div className="mc-content">
          {view === "dashboard" && (
            <DashboardView
              dishes={dishes}
              ingredients={ingredients}
              categories={categories}
            />
          )}

          {view === "restaurants" && (
            <RestaurantsView
              restaurants={restaurants}
              store={store}
              showCreateRest={showCreateRest}
              setShowCreateRest={setShowCreateRest}
              restForm={restForm}
              restLoading={restLoading}
              restError={restError}
              onChangeRestField={handleRestFormChange}
              onSubmitCreateRest={handleCreateRestaurantFromProfile}
              onSelectRestaurant={onSelectRestaurant}
              openInMaps={openInMaps}
            />
          )}

          {view === "categories" && (
            <CategoryView
              currentRestaurant={currentRestaurant}
              categories={categories}
              store={store}
              dispatch={dispatch}
            />
          )}

          {view === "ingredients" && (
            <IngredientsView
              currentRestaurant={currentRestaurant}
              ingredients={ingredients}
              store={store}
              dispatch={dispatch}
            />
          )}

          {view === "dishes" && (
            <DishesView
              currentRestaurant={currentRestaurant}
              categories={categories}
              ingredients={ingredients}
              store={store}
              dispatch={dispatch}
            />
          )}

          {view === "profile" && (
            <ProfileView
              profileName={profileName}
              email={email}
              telefono={telefono}
              direccion={direccion}
              isEditingProfile={isEditingProfile}
              profileLoading={profileLoading}
              profileMsg={profileMsg}
              profileError={profileError}
              showCreateRest={showCreateRest}
              restForm={restForm}
              restLoading={restLoading}
              restError={restError}
              restaurants={restaurants}
              onSubmitProfile={handleProfileSubmit}
              setProfileName={setProfileName}
              setEmail={setEmail}
              setTelefono={setTelefono}
              setDireccion={setDireccion}
              setIsEditingProfile={setIsEditingProfile}
              setShowCreateRest={setShowCreateRest}
              onChangeRestField={handleRestFormChange}
              onSubmitCreateRest={handleCreateRestaurantFromProfile}
              openInMaps={openInMaps}
            />
          )}
        </div>
      </section>
    </div>
  );
}
