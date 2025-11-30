const API_BASE = import.meta.env.VITE_BACKEND_URL;

export function getToken() {
  return localStorage.getItem("token");
}

// Une bien aunque VITE_BACKEND_URL termine en / o /api
function buildUrl(path) {
  if (!API_BASE) throw new Error("Falta VITE_BACKEND_URL en .env");

  // Si el BASE acaba en /api, lo recortamos para evitar /api/api/...
  const base = API_BASE.replace(/\/+$/, "").replace(/\/api$/, "");
  return new URL(path, base).toString(); // path tipo "/api/user/login"
}

export async function apiFetch(path, { method = "GET", body, headers } = {}) {
  const token = getToken();

  const res = await fetch(buildUrl(path), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const msg = (data && (data.msg || data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}
