// src/api.js
export const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

export async function apiFetch(path, opts = {}) {
  const url = API_BASE + path;
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}
