import { useNavigate } from "react-router-dom";
import { useToken } from "./useToken";

const API = "http://localhost:4000/api/auth";

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

    // changes made by swarup

     localStorage.setItem(
    "user",
    JSON.stringify({
      full_name: data.full_name,
      email: data.email,
      // role: data.role,
    })
  );



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
