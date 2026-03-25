// frontend/web/src/apiConfig.js
// Centralized API configuration to prevent 404s and double-prefixing

export const API_BASE = "/api";

export const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { "Authorization": `Bearer ${token}` } : {};
};
