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

  const logout = () => {
    removeToken();
    localStorage.removeItem("user");
    navigate("/login");
  };

  return { login, signup, logout };
}
