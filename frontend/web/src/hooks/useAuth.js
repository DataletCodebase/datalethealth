import { useNavigate } from "react-router-dom";
import { useToken } from "./useToken";

const API = "/api/auth";

export function useAuth() {
  const navigate = useNavigate();
  const { saveToken, removeToken } = useToken();

  const login = async (payload) => {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    saveToken(data.token);


    localStorage.setItem("user", JSON.stringify(data.user));


    navigate("/dashboard");
  };

  const loginOTP = async (payload) => {
    const res = await fetch(`${API}/login-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    saveToken(data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    navigate("/dashboard");
  };

  const signup = async (payload) => {
    const res = await fetch(`${API}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    navigate("/login");
  };

  const checkUserExists = async (identifier) => {
    const res = await fetch(`${API}/check-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier }),
    });
    // The backend returns 200 {exists: true} if found, 404 if not found
    return res.ok;
  };

  const logout = () => {
    removeToken();
    localStorage.removeItem("user");

    // Clear browser cache
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }

    // Clear all storage
    sessionStorage.clear();
    localStorage.clear();

    navigate("/login");
  };

  return { login, loginOTP, signup, checkUserExists, logout };
}
