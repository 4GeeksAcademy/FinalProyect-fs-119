// src/front/v2/components/MasterCard.jsx
import React, { useState, useEffect } from "react";
import "./mastercard.css";
import { api } from "../services/api";
import { apiFetch } from "../services/apiClient";

import CategoryList from "../../pages/CategoryList";
import DishList from "../../components/DishList";

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

function Stat({ label, value }) {
  return (
    <div className="mc-stat">
      <div className="mc-stat-value">{value}</div>
      <div className="mc-stat-label">{label}</div>
    </div>
  );
}

function Table({ title, columns, rows, footer, actions }) {
  return (
    <section className="mc-panel">
      <div className="mc-panel-head">
        <h3>{title}</h3>
        {actions}
      </div>
      <div className="mc-table">
        <div className="mc-tr mc-th">
          {columns.map((c) => (
            <div key={c} className="mc-td">
              {c}
            </div>
          ))}
        </div>

        {rows.length === 0 ? (
          <div className="mc-empty">Nada que mostrar todavía.</div>
        ) : (
          rows.map((r, idx) => (
            <div key={idx} className="mc-tr">
              {r.map((cell, cidx) => (
                <div key={cidx} className="mc-td">
                  {cell}
                </div>
              ))}
            </div>
          ))
        )}

        {footer && <div className="mc-footer">{footer}</div>}
      </div>
    </section>
  );
}

export default function MasterCard({ store, dispatch }) {
  // --- modos secundarios ---
  const [catMode, setCatMode] = useState("list"); // list | create
  const [ingMode, setIngMode] = useState("list"); // list | create

  // --- formulario categorías ---
  const [catName, setCatName] = useState("");
  const [catImage, setCatImage] = useState("");

  // --- formulario ingredientes ---
  const [ingForm, setIngForm] = useState({
    name: "",
    unit: "g",
    price_per_unit: "",
    image_url: "",
    allergens: "", // 👈 NUEVO (va a Ingredients.allergens)
    barcode: "", // 👈 NUEVO (solo para consultar OpenFood, NO se guarda)
  });

  // --- OpenFood (API externa vía backend) ---
  const [ofQuery, setOfQuery] = useState("");
  const [ofResults, setOfResults] = useState([]);
  const [ofLoading, setOfLoading] = useState(false);
  const [ofError, setOfError] = useState("");

  const normalizeAllergensText = (value) => {
    if (!value) return "";
    const items = Array.isArray(value)
      ? value
      : String(value)
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);

    const seen = new Set();
    const out = [];
    for (const it0 of items) {
      const it = String(it0).replace("-", " ").trim();
      const key = it.toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(it);
    }
    return out.join(", ");
  };

  const fillFromOpenFood = (p) => {
    const name = p?.name || "";
    const code = p?.code || "";
    const labels = Array.isArray(p?.allergen_labels) ? p.allergen_labels : [];
    const allergens = normalizeAllergensText(labels);

    setIngForm((prev) => ({
      ...prev,
      name: prev.name || name,
      allergens,
      barcode: prev.barcode || code,
    }));
  };

  const runOpenFoodSearch = async () => {
    const q = (ofQuery || "").trim();
    if (!q) return;

    setOfError("");
    setOfLoading(true);
    try {
      const data = await apiFetch(
        `/api/openfood/search?q=${encodeURIComponent(q)}`,
        { method: "GET" }
      );
      setOfResults(Array.isArray(data?.results) ? data.results : []);
    } catch (err) {
      setOfError(err.message || "Error buscando en OpenFoodFacts");
      setOfResults([]);
    } finally {
      setOfLoading(false);
    }
  };

  const runOpenFoodByBarcode = async () => {
    const code = (ingForm.barcode || "").trim();
    if (!code) return;

    setOfError("");
    setOfLoading(true);
    try {
      const data = await apiFetch(
        `/api/openfood/barcode/${encodeURIComponent(code)}`,
        { method: "GET" }
      );
      if (data?.product) fillFromOpenFood(data.product);
      else throw new Error("Producto no encontrado");
    } catch (err) {
      setOfError(err.message || "Error consultando por barcode");
    } finally {
      setOfLoading(false);
    }
  };

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

  // ---------- ESTADO LOCAL PARA PLATOS ----------
  const [dishMode, setDishMode] = useState("list"); // "list" | "create" | "detail"
  const [dishForm, setDishForm] = useState({
    name: "",
    category_id: "",
    description: "",
  });
  const [dishError, setDishError] = useState("");
  const [dishLoading, setDishLoading] = useState(false);
  const [dishLines, setDishLines] = useState([]);

  // Detalle de plato
  const [dishDetail, setDishDetail] = useState(null);
  const [detailError, setDetailError] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);

  // mini-form para añadir ingrediente en detalle
  const [newLine, setNewLine] = useState({
    ingredient_id: "",
    gross_weight: "",
    decrease_pct: "0",
  });
  const [lineLoading, setLineLoading] = useState(false);
  const [lineError, setLineError] = useState("");

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

  // -------------------------------------------

  const resetDishForm = () => {
    setDishForm({
      name: "",
      category_id: "",
      description: "",
    });
    setDishLines([]);
  };

  const handleDishFieldChange = (field, value) => {
    setDishForm((prev) => ({ ...prev, [field]: value }));
  };

  const addDishLine = () => {
    if (!ingredients.length) return alert("Primero crea ingredientes.");
    setDishLines((prev) => [
      ...prev,
      {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : Date.now() + Math.random(),
        ingredient_id: "",
        gross_weight: "",
        decrease_pct: "0",
      },
    ]);
  };

  const removeDishLine = (id) => {
    setDishLines((prev) => prev.filter((l) => l.id !== id));
  };

  const updateDishLine = (id, patch) => {
    setDishLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...patch } : l))
    );
  };

  // 🔧 helper fino: actualizar solo un plato en el store
  const patchDishInStore = (updatedDish) => {
    if (!updatedDish || !updatedDish.id) return;
    dispatch({
      type: "set_dishes",
      payload: (store.dishes || []).map((d) =>
        d.id === updatedDish.id ? { ...d, ...updatedDish } : d
      ),
    });
  };

  // Helpers dashboard
  const topDishesRows = dishes
    .slice(0, 5)
    .map((d) => [d.name || `Dish #${d.id}`, "—"]);

  // Alerts: sin precio + sin alérgenos (mínimo, sin cambiar la tabla)
  const alertsNoCost = ingredients
    .filter((i) => i.price_per_unit == null || Number(i.price_per_unit) === 0)
    .map((i) => ({ name: i.name || `Ingredient #${i.id}`, status: "No Cost" }));

  const alertsNoAllergens = ingredients
    .filter((i) => !i.allergens || !String(i.allergens).trim())
    .map((i) => ({
      name: i.name || `Ingredient #${i.id}`,
      status: "No Allergens",
    }));

  const alertsRows = [...alertsNoCost, ...alertsNoAllergens]
    .slice(0, 5)
    .map((a) => [a.name, a.status]);

  // Cuando entro en Dishes y tengo restaurante, cargo lista de platos
  useEffect(() => {
    if (view !== "dishes" || !currentRestaurant?.id) return;

    (async () => {
      try {
        const data = await api.getDishes(currentRestaurant.id);
        dispatch({ type: "set_dishes", payload: data.dishes || [] });
      } catch (err) {
        console.error("Error cargando platos:", err);
        dispatch({
          type: "set_error",
          payload: {
            dishes: err.message || "No se pudieron cargar los platos",
          },
        });
      }
    })();
  }, [view, currentRestaurant?.id, dispatch]);

  // Si salgo de Dishes, reseteo modo/errores
  useEffect(() => {
    if (view !== "dishes") {
      setDishMode("list");
      setDishError("");
      setDetailError("");
      setDishLoading(false);
      setDetailLoading(false);
      setDishLines([]);
      setDishDetail(null);
      setNewLine({ ingredient_id: "", gross_weight: "", decrease_pct: "0" });
      setLineError("");
      setLineLoading(false);
    }
  }, [view]);

  // Si salgo de Ingredients, limpio estado OpenFood (para no arrastrar búsquedas)
  useEffect(() => {
    if (view !== "ingredients") {
      setOfQuery("");
      setOfResults([]);
      setOfError("");
      setOfLoading(false);
    }
  }, [view]);

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

    const payload = {
      name: profileName.trim(),
      email: email.trim(),
      telefono: telefono.trim() || null,
      direccion: direccion.trim() || null,
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

  // --- CATEGORIES HANDLERS (MVP) ---
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!currentRestaurant?.id) return;
    const name = catName.trim();
    if (!name) return;

    try {
      dispatch({ type: "set_loading", payload: { categories: true } });
      const payload = { name, image_url: catImage.trim() || null };
      const data = await api.createCategory(currentRestaurant.id, payload);
      const created = data?.categoria || data?.category;

      const updated = created ? [...categories, created] : categories;
      dispatch({
        type: "merge_currentRestaurant",
        payload: { categories: updated },
      });

      setCatName("");
      setCatImage("");
      setCatMode("list");
    } catch (err) {
      console.error(err);
      dispatch({
        type: "set_error",
        payload: { categories: err.message || "Error creando categoría" },
      });
    } finally {
      dispatch({ type: "set_loading", payload: { categories: false } });
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!currentRestaurant?.id) return;
    try {
      await api.deleteCategory(currentRestaurant.id, id);
      const updated = categories.filter((c) => c.id !== id);
      dispatch({
        type: "merge_currentRestaurant",
        payload: { categories: updated },
      });
    } catch (err) {
      console.error(err);
    }
  };

  // --- INGREDIENTS HANDLERS (MVP) ---
  const handleChangeIng = (e) => {
    const { name, value } = e.target;
    setIngForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateIngredient = async (e) => {
    e.preventDefault();
    if (!currentRestaurant?.id) return;

    const name = ingForm.name.trim();
    if (!name) return;

    const payload = {
      name,
      unit: ingForm.unit || "g",
      price_per_unit:
        ingForm.price_per_unit !== "" ? Number(ingForm.price_per_unit) : 0,
      image_url: ingForm.image_url.trim() || null,
      allergens: ingForm.allergens.trim() || null, // 👈 NUEVO
    };

    try {
      dispatch({ type: "set_loading", payload: { ingredients: true } });
      const data = await api.createIngredient(currentRestaurant.id, payload);
      const created = data?.ingrediente || data?.ingredient;

      const updated = created ? [...ingredients, created] : ingredients;
      dispatch({
        type: "merge_currentRestaurant",
        payload: { ingredients: updated },
      });

      setIngForm({
        name: "",
        unit: "g",
        price_per_unit: "",
        image_url: "",
        allergens: "",
        barcode: "",
      });
      setIngMode("list");
    } catch (err) {
      console.error(err);
      dispatch({
        type: "set_error",
        payload: { ingredients: err.message || "Error creando ingrediente" },
      });
    } finally {
      dispatch({ type: "set_loading", payload: { ingredients: false } });
    }
  };

  const handleDeleteIngredient = async (id) => {
    if (!currentRestaurant?.id) return;
    try {
      await api.deleteIngredient(currentRestaurant.id, id);
      const updated = ingredients.filter((i) => i.id !== id);
      dispatch({
        type: "merge_currentRestaurant",
        payload: { ingredients: updated },
      });
    } catch (err) {
      console.error(err);
    }
  };

  // --- DISHES HANDLERS ---
  const handleDishSubmit = async (e) => {
    e.preventDefault();
    if (!currentRestaurant?.id) return;

    setDishError("");
    setDishLoading(true);

    const payload = {
      name: dishForm.name.trim(),
      category_id: dishForm.category_id ? Number(dishForm.category_id) : null,
      description: dishForm.description.trim() || null,
    };

    if (!payload.name) {
      setDishError("El nombre del plato es obligatorio.");
      setDishLoading(false);
      return;
    }

    const validLines = dishLines.filter((l) => {
      if (!l.ingredient_id) return false;
      if (l.gross_weight === "" || isNaN(Number(l.gross_weight))) return false;
      return true;
    });

    try {
      // 1) crear plato
      const data = await api.createDish(currentRestaurant.id, payload);
      const created = data?.dish;
      if (!created) throw new Error("No se devolvió el plato creado.");

      const dishId = created.id;

      // 2) crear líneas
      if (validLines.length) {
        await Promise.all(
          validLines.map((l) =>
            api.addDishIngredient(currentRestaurant.id, dishId, {
              ingredient_id: Number(l.ingredient_id),
              gross_weight: Number(l.gross_weight),
              decrease_pct:
                l.decrease_pct !== "" && !isNaN(Number(l.decrease_pct))
                  ? Number(l.decrease_pct)
                  : 0,
            })
          )
        );
      }

      // 3) refrescar lista de platos
      const listData = await api.getDishes(currentRestaurant.id);
      dispatch({
        type: "set_dishes",
        payload: listData.dishes || [],
      });

      resetDishForm();
      setDishMode("list");
    } catch (err) {
      console.error(err);
      setDishError(err.message || "Error creando plato");
    } finally {
      setDishLoading(false);
    }
  };

  const handleDeleteDish = async (dishId) => {
    if (!currentRestaurant?.id) return;
    try {
      await api.deleteDish(currentRestaurant.id, dishId);
      dispatch({ type: "remove_dish", payload: dishId });
    } catch (err) {
      alert(err.message || "Error al eliminar plato");
    }
  };

  const loadDishDetail = async (dishId) => {
    if (!currentRestaurant?.id) return;
    setDetailError("");
    setDetailLoading(true);
    try {
      const data = await api.getDish(currentRestaurant.id, dishId);
      const detail = data?.dish || data;
      setDishDetail(detail || null);

      // sincronizar lista con el detalle
      if (detail && detail.id) {
        patchDishInStore(detail);
      }
    } catch (err) {
      console.error(err);
      setDetailError(err.message || "No se pudo cargar el detalle del plato");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleViewDish = async (dish) => {
    setDishMode("detail");
    setDishDetail(null);
    await loadDishDetail(dish.id);
  };

  const handleNewLineChange = (field, value) => {
    setNewLine((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddLineToDish = async (e) => {
    e.preventDefault();
    if (!currentRestaurant?.id || !dishDetail?.id) return;

    setLineError("");
    const ingredient_id = newLine.ingredient_id
      ? Number(newLine.ingredient_id)
      : null;
    const gross_weight =
      newLine.gross_weight !== "" ? Number(newLine.gross_weight) : NaN;
    const decrease_pct =
      newLine.decrease_pct !== "" ? Number(newLine.decrease_pct) : 0;

    if (!ingredient_id) {
      setLineError("Selecciona un ingrediente.");
      return;
    }
    if (isNaN(gross_weight) || gross_weight <= 0) {
      setLineError("La cantidad debe ser un número mayor que 0.");
      return;
    }

    try {
      setLineLoading(true);
      await api.addDishIngredient(currentRestaurant.id, dishDetail.id, {
        ingredient_id,
        gross_weight,
        decrease_pct: isNaN(decrease_pct) ? 0 : decrease_pct,
      });

      // recargar detalle (que también sincroniza la lista)
      await loadDishDetail(dishDetail.id);

      // reset mini-form
      setNewLine({
        ingredient_id: "",
        gross_weight: "",
        decrease_pct: "0",
      });
    } catch (err) {
      console.error(err);
      setLineError(err.message || "No se pudo añadir el ingrediente");
    } finally {
      setLineLoading(false);
    }
  };

  // Helpers detalle
  const detailLines =
    dishDetail?.lines ||
    dishDetail?.dish_ingredients ||
    dishDetail?.ingredients ||
    [];

  const findCategoryName = (category_id) => {
    if (!category_id) return null;
    const cat = categories.find((c) => c.id === category_id);
    return cat ? cat.name : null;
  };

  const currentDishCost = dishDetail?.total_cost ?? dishDetail?.cost_price ?? 0;

  // 👇 NUEVO: alérgenos agregados del plato (desde líneas -> ingrediente -> allergens)
  const computeDishAllergens = () => {
    const byId = new Map((ingredients || []).map((i) => [String(i.id), i]));
    const set = new Set();
    let missing = 0;

    for (const line of detailLines || []) {
      const ing =
        line?.ingredient ||
        line?.ingredient_data ||
        byId.get(String(line?.ingredient_id)) ||
        null;

      const text = (ing?.allergens || "").trim();
      if (!text) {
        missing++;
        continue;
      }
      text
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
        .forEach((a) => set.add(a.toLowerCase()));
    }

    return { list: Array.from(set).sort(), missing };
  };

  const dishAllergens = computeDishAllergens();

  return (
    <div className="mc-wrap">
      <aside className="mc-side">
        <div className="mc-brand">
          <div className="mc-logo">Ⓒ</div>
          <div className="mc-brand-text">set a meal</div>
        </div>

        <nav className="mc-nav">
          {NAV.map((item) => (
            <button
              key={item.key}
              className={`mc-nav-item ${view === item.key ? "is-active" : ""}`}
              onClick={() => setView(item.key)}
              disabled={
                ["dashboard", "dishes", "ingredients", "categories"].includes(
                  item.key
                ) && !currentRestaurant?.id
              }
            >
              <span className="mc-dot" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="mc-main">
        <header className="mc-topbar">
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

            {/* CTA contextual por vista */}
            {view === "ingredients" && ingMode === "list" && (
              <button className="mc-cta" onClick={() => setIngMode("create")}>
                New Ingredient
              </button>
            )}
            {view === "ingredients" && ingMode === "create" && (
              <button
                className="mc-cta mc-cta-secondary"
                onClick={() => setIngMode("list")}
              >
                Cancel
              </button>
            )}

            {view === "categories" && catMode === "list" && (
              <button className="mc-cta" onClick={() => setCatMode("create")}>
                New Category
              </button>
            )}
            {view === "categories" && catMode === "create" && (
              <button
                className="mc-cta mc-cta-secondary"
                onClick={() => setCatMode("list")}
              >
                Cancel
              </button>
            )}
          </div>
        </header>

        <div className="mc-content">
          {/* DASHBOARD */}
          {view === "dashboard" && (
            <>
              <div className="mc-stats">
                <Stat label="Dishes" value={dishes.length} />
                <Stat label="Ingredients" value={ingredients.length} />
                <Stat label="Categories" value={categories.length} />
              </div>

              <div className="mc-grid-2">
                <Table
                  title="Top Dishes (MVP)"
                  columns={["Dish", "Margin %"]}
                  rows={topDishesRows}
                />
                <Table
                  title="Ingredient Alerts"
                  columns={["Ingredient", "Status"]}
                  rows={alertsRows}
                  footer={
                    <div className="mc-muted">
                      Tip: completa alérgenos al crear el ingrediente (OpenFood)
                    </div>
                  }
                />
              </div>
            </>
          )}

          {/* RESTAURANTS */}
          {view === "restaurants" && (
            <section className="mc-panel">
              <div className="mc-panel-head">
                <h3>Your restaurants</h3>
                {!showCreateRest && (
                  <button
                    type="button"
                    className="mc-cta"
                    onClick={() => setShowCreateRest(true)}
                  >
                    New restaurant
                  </button>
                )}
                {showCreateRest && (
                  <button
                    type="button"
                    className="mc-cta mc-cta-secondary"
                    onClick={() => {
                      setShowCreateRest(false);
                      setRestError("");
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>

              {restError && <div className="mc-error mb-2">{restError}</div>}

              {showCreateRest && (
                <form
                  className="mc-form"
                  onSubmit={handleCreateRestaurantFromProfile}
                  style={{ maxWidth: 480, marginBottom: "2rem" }}
                >
                  <label className="mc-field">
                    <span>Nombre del restaurante *</span>
                    <input
                      className="mc-input"
                      value={restForm.name}
                      onChange={(e) =>
                        handleRestFormChange("name", e.target.value)
                      }
                      required
                    />
                  </label>

                  <label className="mc-field">
                    <span>Teléfono (opcional)</span>
                    <input
                      className="mc-input"
                      value={restForm.telefono}
                      onChange={(e) =>
                        handleRestFormChange("telefono", e.target.value)
                      }
                    />
                  </label>

                  <label className="mc-field">
                    <span>Dirección (opcional)</span>
                    <input
                      className="mc-input"
                      value={restForm.direccion}
                      onChange={(e) =>
                        handleRestFormChange("direccion", e.target.value)
                      }
                    />
                  </label>

                  <div className="mc-form-actions">
                    <button
                      type="submit"
                      className="mc-cta"
                      disabled={restLoading}
                    >
                      {restLoading ? "Creando..." : "Crear y abrir en dashboard"}
                    </button>
                  </div>
                </form>
              )}

              {store.loading.restaurants && (
                <div className="mc-empty">Loading…</div>
              )}
              {store.error.restaurants && (
                <div className="mc-error">{store.error.restaurants}</div>
              )}

              <div className="mc-cards">
                {restaurants.map((r) => (
                  <button
                    key={r.id}
                    className="mc-card"
                    onClick={() => onSelectRestaurant(r.id)}
                  >
                    <div className="mc-card-avatar">
                      {(r.name || "R")[0].toUpperCase()}
                    </div>
                    <div className="mc-card-body">
                      <div className="mc-card-title">
                        {r.name || `Restaurant #${r.id}`}
                      </div>
                      {r.direccion && (
                        <div className="mc-card-sub mc-card-sub--muted">
                          <span
                            className="mc-link"
                            onClick={(e) => {
                              e.stopPropagation();
                              openInMaps(r.direccion);
                            }}
                          >
                            {r.direccion}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
                {!restaurants.length && !store.loading.restaurants && (
                  <div className="mc-empty">
                    Create your first restaurant to start.
                  </div>
                )}
              </div>
            </section>
          )}

          {/* CATEGORIES */}
          {view === "categories" && (
            <section className="mc-panel">
              {catMode === "list" && (
                <>
                  <div className="mc-panel-head">
                    <h3>Categories</h3>
                  </div>
                  {store.loading.categories && (
                    <div className="mc-empty">Loading…</div>
                  )}
                  {store.error.categories && (
                    <div className="mc-error">{store.error.categories}</div>
                  )}
                  <CategoryList
                    categories={categories}
                    onDelete={handleDeleteCategory}
                  />
                </>
              )}

              {catMode === "create" && (
                <form
                  className="mc-form"
                  onSubmit={handleCreateCategory}
                  style={{ maxWidth: 420 }}
                >
                  <h3 className="mc-form-title">New Category</h3>
                  <label className="mc-field">
                    <span>Name</span>
                    <input
                      type="text"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      required
                    />
                  </label>
                  <label className="mc-field">
                    <span>Image URL (optional)</span>
                    <input
                      type="text"
                      value={catImage}
                      onChange={(e) => setCatImage(e.target.value)}
                    />
                  </label>

                  <div className="mc-form-actions">
                    <button
                      type="button"
                      className="mc-btn-secondary"
                      onClick={() => setCatMode("list")}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="mc-cta">
                      Save
                    </button>
                  </div>
                </form>
              )}
            </section>
          )}

          {/* INGREDIENTS */}
          {view === "ingredients" && (
            <section className="mc-panel">
              {ingMode === "list" && (
                <>
                  <Table
                    title="Ingredients"
                    columns={["Name", "Unit", "Price / unit", "Actions"]}
                    rows={
                      ingredients.length
                        ? ingredients.map((ing) => [
                            ing.name,
                            ing.unit,
                            ing.price_per_unit,
                            <button
                              key={ing.id}
                              className="mc-link-danger"
                              type="button"
                              onClick={() => handleDeleteIngredient(ing.id)}
                            >
                              Delete
                            </button>,
                          ])
                        : []
                    }
                    footer={
                      <div className="mc-muted">
                        Consejo: si falta “No Allergens”, edítalo recreándolo por
                        ahora (MVP). Luego metemos un PUT.
                      </div>
                    }
                  />
                </>
              )}

              {ingMode === "create" && (
                <form
                  className="mc-form"
                  onSubmit={handleCreateIngredient}
                  style={{ maxWidth: 500 }}
                >
                  <h3 className="mc-form-title">New Ingredient</h3>

                  {/* OpenFood helper (mínimo) */}
                  <div className="mc-panel" style={{ padding: "12px" }}>
                    <div
                      className="mc-panel-head"
                      style={{ padding: 0, marginBottom: 8 }}
                    >
                      <h3 style={{ margin: 0, fontSize: 14 }}>
                        Buscar alérgenos (OpenFoodFacts)
                      </h3>
                      <div className="mc-muted" style={{ fontSize: 12 }}>
                        Usa botón (evita rate limit).
                      </div>
                    </div>

                    <div className="mc-field-grid">
                      <label className="mc-field">
                        <span>Buscar por nombre</span>
                        <input
                          type="text"
                          value={ofQuery}
                          onChange={(e) => setOfQuery(e.target.value)}
                          placeholder="leche, galletas…"
                        />
                      </label>

                      <div className="d-flex align-items-end">
                        <button
                          type="button"
                          className="mc-cta mc-cta-secondary"
                          onClick={runOpenFoodSearch}
                          disabled={ofLoading || !(ofQuery || "").trim()}
                        >
                          {ofLoading ? "Buscando..." : "Buscar"}
                        </button>
                      </div>
                    </div>

                    <div className="mc-field-grid" style={{ marginTop: 8 }}>
                      <label className="mc-field">
                        <span>Código de barras</span>
                        <input
                          name="barcode"
                          type="text"
                          value={ingForm.barcode}
                          onChange={handleChangeIng}
                          placeholder="841..."
                        />
                      </label>

                      <div className="d-flex align-items-end">
                        <button
                          type="button"
                          className="mc-cta mc-cta-secondary"
                          onClick={runOpenFoodByBarcode}
                          disabled={ofLoading || !(ingForm.barcode || "").trim()}
                        >
                          {ofLoading ? "Consultando..." : "Consultar"}
                        </button>
                      </div>
                    </div>

                    {ofError && (
                      <div className="mc-error" style={{ marginTop: 8 }}>
                        {ofError}
                      </div>
                    )}

                    {ofResults.length > 0 && (
                      <div style={{ marginTop: 10 }}>
                        <div className="mc-muted" style={{ fontSize: 12 }}>
                          Selecciona un producto:
                        </div>

                        <div className="mc-table" style={{ marginTop: 6 }}>
                          <div className="mc-tr mc-th">
                            <div className="mc-td">Producto</div>
                            <div className="mc-td">Alérgenos</div>
                            <div className="mc-td">Acción</div>
                          </div>

                          {ofResults.slice(0, 6).map((r) => (
                            <div key={r.code || r.name} className="mc-tr">
                              <div className="mc-td">
                                {r.name || "Sin nombre"}
                                {r.brand ? (
                                  <div className="mc-muted" style={{ fontSize: 12 }}>
                                    {r.brand}
                                  </div>
                                ) : null}
                              </div>
                              <div className="mc-td">
                                {(r.allergen_labels || []).join(", ") || (
                                  <span className="mc-muted">Sin datos</span>
                                )}
                              </div>
                              <div className="mc-td">
                                <button
                                  type="button"
                                  className="mc-cta mc-cta-small"
                                  onClick={() => fillFromOpenFood(r)}
                                >
                                  Usar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <label className="mc-field">
                    <span>Name</span>
                    <input
                      name="name"
                      type="text"
                      value={ingForm.name}
                      onChange={handleChangeIng}
                      required
                    />
                  </label>

                  <div className="mc-field-grid">
                    <label className="mc-field">
                      <span>Unit</span>
                      <select
                        name="unit"
                        value={ingForm.unit}
                        onChange={handleChangeIng}
                      >
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="ml">ml</option>
                        <option value="l">l</option>
                        <option value="ud">ud</option>
                      </select>
                    </label>

                    <label className="mc-field">
                      <span>Price per unit</span>
                      <input
                        name="price_per_unit"
                        type="number"
                        step="0.0001"
                        value={ingForm.price_per_unit}
                        onChange={handleChangeIng}
                      />
                    </label>
                  </div>

                  <label className="mc-field">
                    <span>Image URL (optional)</span>
                    <input
                      name="image_url"
                      type="text"
                      value={ingForm.image_url}
                      onChange={handleChangeIng}
                    />
                  </label>

                  {/* NUEVO: alérgenos persistidos en tu modelo */}
                  <label className="mc-field">
                    <span>Allergens (opcional)</span>
                    <input
                      name="allergens"
                      type="text"
                      value={ingForm.allergens}
                      onChange={handleChangeIng}
                      placeholder="gluten, milk, nuts"
                    />
                  </label>

                  <div className="mc-form-actions">
                    <button
                      type="button"
                      className="mc-btn-secondary"
                      onClick={() => setIngMode("list")}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="mc-cta">
                      Save
                    </button>
                  </div>
                </form>
              )}
            </section>
          )}

          {/* DISHES */}
          {view === "dishes" && (
            <section className="mc-panel">
              <div className="mc-panel-head">
                {dishMode === "list" && (
                  <>
                    <h3>Platos</h3>
                    <button
                      className="mc-cta"
                      onClick={() => setDishMode("create")}
                      disabled={!currentRestaurant?.id}
                    >
                      New dish
                    </button>
                  </>
                )}

                {dishMode === "create" && (
                  <>
                    <h3>Nuevo plato</h3>
                    <button
                      type="button"
                      className="mc-ghost"
                      onClick={() => {
                        resetDishForm();
                        setDishMode("list");
                      }}
                    >
                      ← Volver al listado
                    </button>
                  </>
                )}

                {dishMode === "detail" && (
                  <>
                    <h3>
                      Detalle plato
                      {dishDetail?.name ? `: ${dishDetail.name}` : ""}
                    </h3>
                    <button
                      type="button"
                      className="mc-ghost"
                      onClick={() => {
                        setDishMode("list");
                        setDishDetail(null);
                        setNewLine({
                          ingredient_id: "",
                          gross_weight: "",
                          decrease_pct: "0",
                        });
                        setLineError("");
                      }}
                    >
                      ← Volver al listado
                    </button>
                  </>
                )}
              </div>

              {dishMode === "list" && (
                <>
                  {store.loading.dishes && (
                    <div className="mc-empty">Cargando platos…</div>
                  )}
                  {store.error.dishes && (
                    <div className="mc-error">{store.error.dishes}</div>
                  )}

                  {!store.loading.dishes &&
                    (!dishes || dishes.length === 0) && (
                      <div className="mc-empty">
                        Aún no tienes platos en este restaurante.
                      </div>
                    )}

                  {dishes && dishes.length > 0 && (
                    <DishList
                      dishes={dishes}
                      categories={categories}
                      onDelete={handleDeleteDish}
                      onView={handleViewDish}
                    />
                  )}
                </>
              )}

              {dishMode === "create" && (
                <form className="mc-form" onSubmit={handleDishSubmit}>
                  {dishError && <div className="mc-error">{dishError}</div>}

                  <div className="mc-form-row">
                    <label>Nombre del plato *</label>
                    <input
                      className="mc-input"
                      value={dishForm.name}
                      onChange={(e) =>
                        handleDishFieldChange("name", e.target.value)
                      }
                      placeholder="Ej: Paella de marisco"
                      required
                    />
                  </div>

                  <div className="mc-form-row">
                    <label>Categoría (opcional)</label>
                    <select
                      className="mc-input"
                      value={dishForm.category_id}
                      onChange={(e) =>
                        handleDishFieldChange("category_id", e.target.value)
                      }
                    >
                      <option value="">Sin categoría</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mc-form-row">
                    <label>Descripción (opcional)</label>
                    <textarea
                      className="mc-input"
                      rows={3}
                      value={dishForm.description}
                      onChange={(e) =>
                        handleDishFieldChange("description", e.target.value)
                      }
                      placeholder="Breve descripción del plato"
                    />
                  </div>

                  <hr />

                  <div className="mc-form-row">
                    <div className="d-flex justify-content-between align-items-center">
                      <label>Ingredientes del plato</label>
                      <button
                        type="button"
                        className="mc-cta mc-cta-secondary"
                        onClick={addDishLine}
                        disabled={!ingredients.length}
                      >
                        + Añadir ingrediente
                      </button>
                    </div>

                    {!ingredients.length && (
                      <div className="mc-muted small mt-1">
                        Primero crea ingredientes en la vista Ingredients.
                      </div>
                    )}

                    {dishLines.length === 0 && ingredients.length > 0 && (
                      <div className="mc-empty">
                        No has añadido ingredientes aún.
                      </div>
                    )}

                    {dishLines.length > 0 && (
                      <div className="mc-di-lines">
                        {dishLines.map((line) => (
                          <div
                            key={line.id}
                            className="mc-di-line d-flex gap-2 align-items-end mb-2"
                          >
                            <div className="flex-grow-1">
                              <label className="mc-field">
                                <span>Ingrediente</span>
                                <select
                                  className="mc-input"
                                  value={line.ingredient_id}
                                  onChange={(e) =>
                                    updateDishLine(line.id, {
                                      ingredient_id: e.target.value,
                                    })
                                  }
                                >
                                  <option value="">Selecciona…</option>
                                  {ingredients.map((i) => (
                                    <option key={i.id} value={i.id}>
                                      {i.name} — {i.price_per_unit} / {i.unit}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </div>

                            <div>
                              <label className="mc-field">
                                <span>Cantidad bruta</span>
                                <input
                                  className="mc-input"
                                  type="number"
                                  min="0"
                                  step="0.0001"
                                  value={line.gross_weight}
                                  onChange={(e) =>
                                    updateDishLine(line.id, {
                                      gross_weight: e.target.value,
                                    })
                                  }
                                  placeholder="Ej: 150"
                                />
                              </label>
                            </div>

                            <div>
                              <label className="mc-field">
                                <span>Merma %</span>
                                <input
                                  className="mc-input"
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  value={line.decrease_pct}
                                  onChange={(e) =>
                                    updateDishLine(line.id, {
                                      decrease_pct: e.target.value,
                                    })
                                  }
                                  placeholder="0"
                                />
                              </label>
                            </div>

                            <button
                              type="button"
                              className="mc-link-danger"
                              onClick={() => removeDishLine(line.id)}
                            >
                              Eliminar
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mc-form-actions">
                    <button
                      type="button"
                      className="mc-ghost"
                      onClick={() => {
                        resetDishForm();
                        setDishMode("list");
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="mc-cta"
                      disabled={dishLoading}
                    >
                      {dishLoading ? "Creando..." : "Crear plato"}
                    </button>
                  </div>
                </form>
              )}

              {dishMode === "detail" && (
                <div className="mc-dish-detail">
                  {detailLoading && (
                    <div className="mc-empty">Cargando detalle…</div>
                  )}
                  {detailError && <div className="mc-error">{detailError}</div>}
                  {dishDetail && !detailLoading && (
                    <>
                      {/* Parte superior: resumen del plato */}
                      <div className="mc-dish-header">
                        <h4>{dishDetail.name}</h4>
                        <div className="mc-muted">
                          {findCategoryName(dishDetail.category_id) && (
                            <span>
                              Categoría:{" "}
                              {findCategoryName(dishDetail.category_id)}
                            </span>
                          )}
                        </div>
                        <div className="mt-2">
                          <span className="badge bg-secondary">
                            Coste total: {currentDishCost} €
                          </span>
                        </div>
                        {dishDetail.description && (
                          <p className="mt-2">{dishDetail.description}</p>
                        )}

                        {/* NUEVO: alérgenos del plato */}
                        <div className="mt-3">
                          <div className="mc-muted" style={{ marginBottom: 6 }}>
                            Alérgenos del plato:
                          </div>
                          {dishAllergens.list.length ? (
                            <div className="d-flex flex-wrap gap-2">
                              {dishAllergens.list.map((a) => (
                                <span key={a} className="badge bg-warning text-dark">
                                  {a}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="mc-muted">
                              No hay alérgenos registrados (o faltan datos).
                            </div>
                          )}
                          {dishAllergens.missing > 0 && (
                            <div className="mc-muted" style={{ marginTop: 6 }}>
                              Nota: {dishAllergens.missing} ingrediente(s) sin
                              alérgenos en su ficha.
                            </div>
                          )}
                        </div>
                      </div>

                      <hr />

                      {/* Parte central: ingredientes / líneas */}
                      <div className="mc-dish-lines">
                        <h5>Ingredientes del plato</h5>

                        {detailLines.length === 0 && (
                          <div className="mc-empty">
                            Este plato todavía no tiene ingredientes asociados.
                          </div>
                        )}

                        {detailLines.length > 0 && (
                          <div className="mc-table">
                            <div className="mc-tr mc-th">
                              <div className="mc-td">Ingrediente</div>
                              <div className="mc-td">Cantidad</div>
                              <div className="mc-td">Merma %</div>
                              <div className="mc-td">Coste línea</div>
                            </div>
                            {detailLines.map((line, idx) => {
                              const ing =
                                line.ingredient || line.ingredient_data || null;
                              const name =
                                ing?.name ||
                                line.ingredient_name ||
                                `#${line.ingredient_id}`;
                              const unit = ing?.unit || line.unit || "";
                              const qty = line.gross_weight ?? line.qty ?? 0;
                              const dec =
                                line.decrease_pct ?? line.merma_pct ?? 0;
                              const lineCost =
                                line.ingredient_cost ??
                                line.line_cost ??
                                line.cost ??
                                0;

                              return (
                                <div key={idx} className="mc-tr">
                                  <div className="mc-td">{name}</div>
                                  <div className="mc-td">
                                    {qty} {unit}
                                  </div>
                                  <div className="mc-td">{dec} %</div>
                                  <div className="mc-td">{lineCost} €</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <hr />

                      {/* Parte inferior: mini-form para añadir ingrediente */}
                      <div className="mc-dish-add-line">
                        <h5>Añadir ingrediente</h5>

                        {lineError && (
                          <div className="mc-error mb-2">{lineError}</div>
                        )}

                        <form
                          className="mc-form-inline"
                          onSubmit={handleAddLineToDish}
                        >
                          <div className="mc-form-row d-flex gap-2 flex-wrap">
                            <div style={{ minWidth: 200, flex: "1 1 auto" }}>
                              <label className="mc-field">
                                <span>Ingrediente</span>
                                <select
                                  className="mc-input"
                                  value={newLine.ingredient_id}
                                  onChange={(e) =>
                                    handleNewLineChange(
                                      "ingredient_id",
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="">Selecciona…</option>
                                  {ingredients.map((i) => (
                                    <option key={i.id} value={i.id}>
                                      {i.name} — {i.price_per_unit} / {i.unit}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </div>

                            <div style={{ minWidth: 120 }}>
                              <label className="mc-field">
                                <span>Cantidad bruta</span>
                                <input
                                  className="mc-input"
                                  type="number"
                                  min="0"
                                  step="0.0001"
                                  value={newLine.gross_weight}
                                  onChange={(e) =>
                                    handleNewLineChange(
                                      "gross_weight",
                                      e.target.value
                                    )
                                  }
                                />
                              </label>
                            </div>

                            <div style={{ minWidth: 120 }}>
                              <label className="mc-field">
                                <span>Merma %</span>
                                <input
                                  className="mc-input"
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  value={newLine.decrease_pct}
                                  onChange={(e) =>
                                    handleNewLineChange(
                                      "decrease_pct",
                                      e.target.value
                                    )
                                  }
                                />
                              </label>
                            </div>

                            <div className="d-flex align-items-end">
                              <button
                                type="submit"
                                className="mc-cta"
                                disabled={lineLoading}
                              >
                                {lineLoading
                                  ? "Añadiendo..."
                                  : "Añadir ingrediente"}
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </>
                  )}
                </div>
              )}
            </section>
          )}

          {/* PROFILE dentro del hub */}
          {view === "profile" && (
            <section className="mc-panel">
              <div className="mc-panel-head">
                <h3>Perfil</h3>
              </div>

              {/* ... el resto de tu Profile queda igual ... */}
              {/* (No lo toco para no modificar de más) */}

              <div className="mc-grid-2">
                {/* Columna izquierda: datos de usuario */}
                <div className="mc-profile-left">
                  {profileError && (
                    <div className="mc-error mb-2">{profileError}</div>
                  )}
                  {profileMsg && (
                    <div className="mc-success mb-2">{profileMsg}</div>
                  )}

                  <div className="mc-profile-avatar-wrap">
                    <div className="mc-profile-avatar">
                      <img
                        src={getAvatarFromText(profileName || email || "User")}
                        alt="Avatar"
                      />
                    </div>
                  </div>

                  {profileLoading && !isEditingProfile && (
                    <div className="mc-empty">Cargando perfil…</div>
                  )}

                  {isEditingProfile ? (
                    <form className="mc-form" onSubmit={handleProfileSubmit}>
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
                        <button
                          type="submit"
                          className="mc-cta"
                          disabled={profileLoading}
                        >
                          {profileLoading ? "Guardando..." : "Guardar cambios"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="mc-profile-readonly">
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
                            <span
                              className="mc-link"
                              onClick={() => openInMaps(direccion)}
                            >
                              {direccion}
                            </span>
                          ) : (
                            <span className="mc-muted">-</span>
                          )}
                        </div>
                      </div>

                      <div className="mc-form-actions mt-3">
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
                </div>

                {/* Columna derecha: restaurantes del usuario + crear nuevo */}
                <div className="mc-profile-right">
                  <div className="mc-panel-subhead">
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
                        onClick={() => {
                          setShowCreateRest(false);
                          setRestError("");
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  {restError && <div className="mc-error mb-2">{restError}</div>}

                  {showCreateRest && (
                    <form
                      className="mc-form"
                      onSubmit={handleCreateRestaurantFromProfile}
                      style={{ maxWidth: 480 }}
                    >
                      <label className="mc-field">
                        <span>Nombre del restaurante *</span>
                        <input
                          className="mc-input"
                          value={restForm.name}
                          onChange={(e) =>
                            handleRestFormChange("name", e.target.value)
                          }
                          required
                        />
                      </label>

                      <label className="mc-field">
                        <span>Teléfono (opcional)</span>
                        <input
                          className="mc-input"
                          value={restForm.telefono}
                          onChange={(e) =>
                            handleRestFormChange("telefono", e.target.value)
                          }
                        />
                      </label>

                      <label className="mc-field">
                        <span>Dirección (opcional)</span>
                        <input
                          className="mc-input"
                          value={restForm.direccion}
                          onChange={(e) =>
                            handleRestFormChange("direccion", e.target.value)
                          }
                        />
                      </label>

                      <div className="mc-form-actions">
                        <button
                          type="submit"
                          className="mc-cta"
                          disabled={restLoading}
                        >
                          {restLoading ? "Creando..." : "Crear y abrir en dashboard"}
                        </button>
                      </div>
                    </form>
                  )}

                  {!showCreateRest && (
                    <div className="mc-profile-restaurants-list">
                      {profileLoading && !restaurants.length && (
                        <div className="mc-empty">Cargando…</div>
                      )}

                      {!profileLoading && !restaurants.length && (
                        <div className="mc-empty">
                          Aún no has creado restaurantes.
                        </div>
                      )}

                      {restaurants.length > 0 && (
                        <div className="mc-list">
                          {restaurants.map((r) => (
                            <div
                              key={r.id}
                              className="mc-list-item mc-list-item--rest"
                            >
                              <div className="mc-list-avatar">
                                <img
                                  src={getAvatarFromText(r.name)}
                                  alt={r.name}
                                />
                              </div>
                              <div className="mc-list-body">
                                <div className="mc-list-title">
                                  {r.name || `Restaurant #${r.id}`}
                                </div>
                                {r.telefono && (
                                  <div className="mc-list-sub mc-muted">
                                    Teléfono: {r.telefono}
                                  </div>
                                )}
                                {r.direccion && (
                                  <div className="mc-list-sub">
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
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}
