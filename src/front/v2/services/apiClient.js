// src/front/v2/services/apiClient.js
const API_BASE = import.meta.env.VITE_BACKEND_URL;

export function getToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null;
}

// Une bien aunque VITE_BACKEND_URL termine en / o /api
function buildUrl(path) {
  if (!API_BASE) throw new Error("Falta VITE_BACKEND_URL en .env");

  // Si el BASE acaba en /api, lo recortamos para evitar /api/api/...
  const base = API_BASE.replace(/\/+$/, "").replace(/\/api$/, "");
  // path tipo "/api/user/login"
  return new URL(path, base).toString();
}

export async function apiFetch(
  path,
  { method = "GET", body, headers } = {}
) {
  const token = getToken();

  // 👇 Normalizamos el body:
  // - si es objeto → JSON.stringify
  // - si ya es string → lo dejamos tal cual
  // - si es null/undefined → no enviamos body
  let finalBody = body;
  if (finalBody !== undefined && finalBody !== null) {
    if (typeof finalBody !== "string") {
      finalBody = JSON.stringify(finalBody);
    }
  } else {
    finalBody = undefined;
  }

  const res = await fetch(buildUrl(path), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: finalBody,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg =
      (data && (data.msg || data.error || data.message)) ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}
